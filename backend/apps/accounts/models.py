from django.db import models
from django.contrib.auth.models import User

class AdminProfile(models.Model):
    ROLE_CHOICES = [
        ('super_admin', 'Super Administrator'),
        ('manager', 'Store Manager'),
        ('staff', 'Staff Member'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='super_admin')
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.role}"
