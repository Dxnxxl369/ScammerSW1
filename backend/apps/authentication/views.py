import requests
from django.conf import settings
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from .models import Anonimo
from .responses import respuesta_error, respuesta_exitosa
from .serializers import ActualizarUsuarioSerializer, AnonimoSerializer, RegistroSerializer
from .services import AnonimoService, UsuarioService


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'backend': 'ok',
            'mongodb': self._check_mongodb(),
            'supabase': self._check_supabase(),
        })

    def _check_mongodb(self):
        try:
            client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=3000)
            client.admin.command('ping')
            return 'ok'
        except ConnectionFailure as e:
            return f'error: {e}'
        except Exception as e:
            return f'error: {e}'

    def _check_supabase(self):
        try:
            url = f"{settings.SUPABASE_URL}/auth/v1/settings"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return 'ok'
            return f'error: status {response.status_code}'
        except requests.exceptions.Timeout:
            return 'error: timeout'
        except Exception as e:
            return f'error: {e}'


from rest_framework.response import Response  # noqa: E402 (needed for HealthCheckView above)


class RegistroView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if not serializer.is_valid():
            return respuesta_error('VALIDACION', 'Datos inválidos', status.HTTP_400_BAD_REQUEST)

        if UsuarioService.existe_correo(serializer.validated_data['correo']):
            return respuesta_error('CORREO_DUPLICADO', 'El correo ya está registrado', status.HTTP_409_CONFLICT)

        if UsuarioService.existe_username(serializer.validated_data['nombre_usuario']):
            return respuesta_error('NOMBRE_USUARIO_DUPLICADO', 'El nombre de usuario ya existe', status.HTTP_409_CONFLICT)

        usuario, error = UsuarioService.crear_desde_supabase(
            id_supabase=request.user.id,
            correo=serializer.validated_data['correo'],
            nombre_usuario=serializer.validated_data['nombre_usuario'],
            nombre_completo=serializer.validated_data.get('nombre_completo'),
            pais=serializer.validated_data.get('pais', 'BO'),
        )

        if error:
            return respuesta_error(error, 'No se pudo crear el usuario', status.HTTP_409_CONFLICT)

        return respuesta_exitosa(usuario.to_dict(), mensaje='Usuario creado correctamente', codigo_http=status.HTTP_201_CREATED)


class YoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = UsuarioService.obtener_por_supabase_id(request.user.id)
        if not usuario:
            return respuesta_error('NO_REGISTRADO', 'Debe completar el registro', status.HTTP_404_NOT_FOUND)
        return respuesta_exitosa(usuario.to_dict())

    def patch(self, request):
        serializer = ActualizarUsuarioSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return respuesta_error('VALIDACION', 'Datos inválidos', status.HTTP_400_BAD_REQUEST)

        usuario, error = UsuarioService.actualizar(request.user.id, serializer.validated_data)
        if error:
            return respuesta_error(error, 'No se pudo actualizar', status.HTTP_400_BAD_REQUEST)

        return respuesta_exitosa(usuario.to_dict(), mensaje='Perfil actualizado')


class CrearSesionAnonimaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ip = self._obtener_ip(request)
        navegador = request.META.get('HTTP_USER_AGENT', '')[:500]
        pais = request.data.get('pais', 'BO')
        anonimo = AnonimoService.crear_sesion(ip=ip, navegador=navegador, pais=pais)
        return respuesta_exitosa(anonimo.to_dict(), mensaje='Sesión anónima creada', codigo_http=status.HTTP_201_CREATED)

    def _obtener_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class SesionAnonimaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id_sesion):
        anonimo = AnonimoService.obtener_por_id_sesion(id_sesion)
        if not anonimo:
            return respuesta_error('SESION_NO_ENCONTRADA', 'Sesión inválida o expirada', status.HTTP_404_NOT_FOUND)
        return respuesta_exitosa(anonimo.to_dict())


class IncrementarIntentosAnonimoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, id_sesion):
        anonimo = AnonimoService.incrementar_intentos(id_sesion)
        if not anonimo:
            return respuesta_error('SESION_NO_ENCONTRADA', 'Sesión inválida o expirada', status.HTTP_404_NOT_FOUND)
        return respuesta_exitosa(anonimo.to_dict())
