from django.urls import path
from .views import (
    HealthCheckView,
    RegistroView,
    YoView,
    CrearSesionAnonimaView,
    SesionAnonimaView,
    IncrementarIntentosAnonimoView,
)
from .views_admin import (
    ListarUsuariosView,
    BloquearUsuarioView,
    DesbloquearUsuarioView,
    CambiarPlanView,
    CambiarRolView,
    EstadisticasView,
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health'),
    path('auth/registro/', RegistroView.as_view(), name='registro'),
    path('auth/yo/', YoView.as_view(), name='yo'),
    path('anonimos/sesion/', CrearSesionAnonimaView.as_view(), name='crear_sesion_anonima'),
    path('anonimos/sesion/<str:id_sesion>/', SesionAnonimaView.as_view(), name='sesion_anonima'),
    path('anonimos/sesion/<str:id_sesion>/intento/', IncrementarIntentosAnonimoView.as_view(), name='incrementar_intentos_anonimo'),
    path('admin/usuarios/', ListarUsuariosView.as_view(), name='admin_listar_usuarios'),
    path('admin/usuarios/<str:id_supabase>/bloquear/', BloquearUsuarioView.as_view(), name='admin_bloquear'),
    path('admin/usuarios/<str:id_supabase>/desbloquear/', DesbloquearUsuarioView.as_view(), name='admin_desbloquear'),
    path('admin/usuarios/<str:id_supabase>/plan/', CambiarPlanView.as_view(), name='admin_cambiar_plan'),
    path('admin/usuarios/<str:id_supabase>/rol/', CambiarRolView.as_view(), name='admin_cambiar_rol'),
    path('admin/estadisticas/', EstadisticasView.as_view(), name='admin_estadisticas'),
]
