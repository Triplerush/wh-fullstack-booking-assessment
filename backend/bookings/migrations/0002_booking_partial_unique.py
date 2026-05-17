"""Índice único parcial en (property, check_in, check_out) cuando el estado está activo.

Última red de protección contra duplicados; el control real de solapamientos
vive en `bookings/services.py` con `transaction.atomic` + `SELECT ... FOR UPDATE`.
"""
from django.db import migrations

SQL_CREATE = """
CREATE UNIQUE INDEX IF NOT EXISTS booking_active_range_unique
ON bookings_booking (property_id, check_in, check_out)
WHERE status IN ('pending', 'confirmed');
"""

SQL_DROP = "DROP INDEX IF EXISTS booking_active_range_unique;"


class Migration(migrations.Migration):
    dependencies = [
        ("bookings", "0001_initial"),
    ]
    operations = [
        migrations.RunSQL(sql=SQL_CREATE, reverse_sql=SQL_DROP),
    ]
