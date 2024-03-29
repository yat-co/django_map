from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from apps.customer.views import SampleMapView

urlpatterns = [
    path('', SampleMapView.as_view(), name='sample_map_view'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)