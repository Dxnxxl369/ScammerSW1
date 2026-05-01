import uuid
from datetime import datetime, timedelta
from typing import Optional
from mongoengine.errors import NotUniqueError, ValidationError
from .models import Usuario, Anonimo


class UsuarioService:
    @staticmethod
    def crear_desde_supabase(
        id_supabase: str,
        correo: str,
        nombre_usuario: str,
        nombre_completo: Optional[str] = None,
        pais: str = 'BO',
    ) -> tuple[Optional[Usuario], Optional[str]]:
        correo_norm = correo.lower().strip()
        username_norm = nombre_usuario.lower().strip()

        if Usuario.objects(correo=correo_norm).first():
            return None, 'CORREO_DUPLICADO'
        if Usuario.objects(nombre_usuario=username_norm).first():
            return None, 'NOMBRE_USUARIO_DUPLICADO'
        if Usuario.objects(id_supabase=id_supabase).first():
            return None, 'ID_SUPABASE_DUPLICADO'

        try:
            usuario = Usuario(
                id_supabase=id_supabase,
                correo=correo_norm,
                nombre_usuario=username_norm,
                nombre_completo=nombre_completo,
                pais=pais,
            )
            usuario.save()
            return usuario, None
        except NotUniqueError:
            return None, 'DUPLICADO'
        except ValidationError as e:
            return None, f'VALIDACION: {str(e)}'

    @staticmethod
    def obtener_por_supabase_id(id_supabase: str) -> Optional[Usuario]:
        return Usuario.objects(id_supabase=id_supabase).first()

    @staticmethod
    def obtener_por_correo(correo: str) -> Optional[Usuario]:
        return Usuario.objects(correo=correo.lower()).first()

    @staticmethod
    def obtener_por_username(nombre_usuario: str) -> Optional[Usuario]:
        return Usuario.objects(nombre_usuario=nombre_usuario.lower()).first()

    @staticmethod
    def actualizar(id_supabase: str, datos: dict) -> tuple[Optional[Usuario], Optional[str]]:
        usuario = Usuario.objects(id_supabase=id_supabase).first()
        if not usuario:
            return None, 'NO_ENCONTRADO'
        campos_permitidos = ['nombre_completo', 'pais']
        for campo, valor in datos.items():
            if campo in campos_permitidos:
                setattr(usuario, campo, valor)
        try:
            usuario.save()
            return usuario, None
        except (NotUniqueError, ValidationError) as e:
            return None, str(e)

    @staticmethod
    def incrementar_intentos(id_supabase: str) -> Optional[Usuario]:
        return Usuario.objects(id_supabase=id_supabase).modify(
            inc__intentos_usados=1, new=True
        )

    @staticmethod
    def existe_correo(correo: str) -> bool:
        return Usuario.objects(correo=correo.lower()).first() is not None

    @staticmethod
    def existe_username(nombre_usuario: str) -> bool:
        return Usuario.objects(nombre_usuario=nombre_usuario.lower()).first() is not None


class AnonimoService:
    DIAS_EXPIRACION = 30

    @staticmethod
    def crear_sesion(
        ip: Optional[str] = None,
        navegador: Optional[str] = None,
        pais: Optional[str] = None,
    ) -> Anonimo:
        anonimo = Anonimo(
            id_sesion=str(uuid.uuid4()),
            ip=ip,
            navegador=navegador,
            pais=pais,
            fecha_expiracion=datetime.utcnow() + timedelta(days=AnonimoService.DIAS_EXPIRACION),
        )
        anonimo.save()
        return anonimo

    @staticmethod
    def obtener_por_id_sesion(id_sesion: str) -> Optional[Anonimo]:
        return Anonimo.objects(id_sesion=id_sesion).first()

    @staticmethod
    def incrementar_intentos(id_sesion: str) -> Optional[Anonimo]:
        return Anonimo.objects(id_sesion=id_sesion).modify(
            inc__intentos_usados=1, new=True
        )


class AdminService:
    @staticmethod
    def listar_usuarios(
        rol: Optional[str] = None,
        plan: Optional[str] = None,
        bloqueado: Optional[bool] = None,
        busqueda: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 20,
    ) -> dict:
        query = Usuario.objects
        if rol:
            query = query.filter(rol=rol)
        if plan:
            query = query.filter(plan=plan)
        if bloqueado is not None:
            query = query.filter(bloqueado=bloqueado)
        if busqueda:
            query = query.filter(
                __raw__={
                    '$or': [
                        {'correo': {'$regex': busqueda, '$options': 'i'}},
                        {'nombre_usuario': {'$regex': busqueda, '$options': 'i'}},
                        {'nombre_completo': {'$regex': busqueda, '$options': 'i'}},
                    ]
                }
            )
        total = query.count()
        skip = (pagina - 1) * por_pagina
        usuarios = query.order_by('-fecha_creacion').skip(skip).limit(por_pagina)
        return {
            'usuarios': [u.to_dict() for u in usuarios],
            'total': total,
            'pagina': pagina,
            'por_pagina': por_pagina,
            'total_paginas': (total + por_pagina - 1) // por_pagina,
        }

    @staticmethod
    def bloquear_usuario(id_supabase: str) -> tuple[Optional[Usuario], Optional[str]]:
        usuario = Usuario.objects(id_supabase=id_supabase).first()
        if not usuario:
            return None, 'NO_ENCONTRADO'
        usuario.bloqueado = True
        usuario.save()
        return usuario, None

    @staticmethod
    def desbloquear_usuario(id_supabase: str) -> tuple[Optional[Usuario], Optional[str]]:
        usuario = Usuario.objects(id_supabase=id_supabase).first()
        if not usuario:
            return None, 'NO_ENCONTRADO'
        usuario.bloqueado = False
        usuario.save()
        return usuario, None

    @staticmethod
    def cambiar_plan(id_supabase: str, plan: str) -> tuple[Optional[Usuario], Optional[str]]:
        if plan not in ['gratis', 'pro']:
            return None, 'PLAN_INVALIDO'
        usuario = Usuario.objects(id_supabase=id_supabase).first()
        if not usuario:
            return None, 'NO_ENCONTRADO'
        usuario.plan = plan
        usuario.save()
        return usuario, None

    @staticmethod
    def cambiar_rol(id_supabase: str, rol: str) -> tuple[Optional[Usuario], Optional[str]]:
        if rol not in ['administrador', 'usuario']:
            return None, 'ROL_INVALIDO'
        usuario = Usuario.objects(id_supabase=id_supabase).first()
        if not usuario:
            return None, 'NO_ENCONTRADO'
        usuario.rol = rol
        usuario.save()
        return usuario, None

    @staticmethod
    def estadisticas() -> dict:
        return {
            'total_usuarios': Usuario.objects.count(),
            'administradores': Usuario.objects(rol='administrador').count(),
            'usuarios_normales': Usuario.objects(rol='usuario').count(),
            'plan_gratis': Usuario.objects(plan='gratis').count(),
            'plan_pro': Usuario.objects(plan='pro').count(),
            'bloqueados': Usuario.objects(bloqueado=True).count(),
            'activos': Usuario.objects(activo=True, bloqueado=False).count(),
        }
