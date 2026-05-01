from datetime import datetime
from mongoengine import (
    Document, StringField, EmailField, BooleanField,
    DateTimeField, IntField
)


class Usuario(Document):
    id_supabase = StringField(required=True, unique=True, max_length=64)
    correo = EmailField(required=True, unique=True, max_length=120)
    nombre_usuario = StringField(required=True, unique=True, max_length=50, min_length=3)
    nombre_completo = StringField(max_length=120)
    rol = StringField(choices=['administrador', 'usuario'], default='usuario')
    plan = StringField(choices=['gratis', 'pro'], default='gratis')
    pais = StringField(default='BO', max_length=2)
    activo = BooleanField(default=True)
    bloqueado = BooleanField(default=False)
    intentos_usados = IntField(default=0, min_value=0)
    fecha_creacion = DateTimeField(default=datetime.utcnow)
    fecha_actualizacion = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'usuarios',
        'indexes': [
            {'fields': ['id_supabase'], 'unique': True, 'name': 'id_supabase_unico'},
            {'fields': ['correo'], 'unique': True, 'name': 'correo_unico'},
            {'fields': ['nombre_usuario'], 'unique': True, 'name': 'nombre_usuario_unico'},
            {'fields': ['rol']},
            {'fields': ['plan']},
            {'fields': ['-fecha_creacion']},
        ]
    }

    def save(self, *args, **kwargs):
        if self.correo:
            self.correo = self.correo.lower().strip()
        if self.nombre_usuario:
            self.nombre_usuario = self.nombre_usuario.lower().strip()
        self.fecha_actualizacion = datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': str(self.id),
            'id_supabase': self.id_supabase,
            'correo': self.correo,
            'nombre_usuario': self.nombre_usuario,
            'nombre_completo': self.nombre_completo,
            'rol': self.rol,
            'plan': self.plan,
            'pais': self.pais,
            'activo': self.activo,
            'bloqueado': self.bloqueado,
            'intentos_usados': self.intentos_usados,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }


class Anonimo(Document):
    id_sesion = StringField(required=True, unique=True, max_length=64)
    ip = StringField(max_length=45)
    navegador = StringField(max_length=500)
    pais = StringField(max_length=2)
    intentos_usados = IntField(default=0, min_value=0)
    fecha_creacion = DateTimeField(default=datetime.utcnow)
    fecha_expiracion = DateTimeField(required=True)

    meta = {
        'collection': 'anonimos',
        'indexes': [
            {'fields': ['id_sesion'], 'unique': True, 'name': 'id_sesion_unico'},
            {'fields': ['fecha_expiracion'], 'expireAfterSeconds': 0, 'name': 'borrado_automatico'},
            {'fields': ['ip']},
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'id_sesion': self.id_sesion,
            'ip': self.ip,
            'navegador': self.navegador,
            'pais': self.pais,
            'intentos_usados': self.intentos_usados,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_expiracion': self.fecha_expiracion.isoformat() if self.fecha_expiracion else None,
        }
