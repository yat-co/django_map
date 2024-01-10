from django.conf import settings
from django.shortcuts import render
from django.views import View

import logging
import json
import requests
from typing import Dict, List


logger = logging.getLogger('service')


def get_route_path_json() -> List[Dict]:
    return [
        {
            "display": "Salina, KS",
            "longitude": -97.621054,
            "latitude": 38.844947,
            "marker": "blue_donut"
        },
        {
            "display": "Hays, KS 67601",
            "longitude": -99.331734,
            "latitude": 38.848648,
            "marker": "purple_cirle"
        },
        {
            "display": "Indianapolis, IN 46255",
            "longitude": -86.158,
            "latitude": 39.7684,
            "marker": "purple_cirle"
        },
        {
            "display": "Greeneville, TN 37744",
            "longitude": -82.8548,
            "latitude": 36.1683,
            "marker": "purple_cirle"
        },
        {
            "display": "Kingsport Metro Area, TN",
            "longitude": -82.567216,
            "latitude": 36.568319,
            "marker": "blue_donut"
        },
    ]

def get_mapbox_response(route_path: Dict) -> Dict:
    long_lat_str = ';'.join([f"{stop['longitude']},{stop['latitude']}" for stop in route_path])

    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{long_lat_str}?&access_token={settings.MAPBOX_API_KEY}&alternatives=false&exclude=toll&geometries=polyline6&language=en&overview=simplified"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    logger.error(
        f"Failed to fetch Mapbox routing: {str(response.reason)} {str(response.text)}"
    )
    return {}


class SampleMapView(View):
    """
    Sample Map View -> Given route render Map with Driving Route Shown, Markers at Each Point    
    """
    template_name = 'customer/sample_map.html'

    def get(self, *args, **kwargs):
        context = {"MAPBOX_API_KEY": settings.MAPBOX_API_KEY}

        # Dummy function, business logic fetches the route
        route_path = get_route_path_json()
        long_lat_mapbox_str = ';'.join([f"{stop['longitude']},{stop['latitude']}" for stop in route_path])
        longs = [stop['longitude'] for stop in route_path]
        lats = [stop['latitude'] for stop in route_path]
        long_diff = (max(longs) - min(longs)) * 0.10
        lat_diff = (max(lats) - min(lats)) * 0.10
        map_bounds = [
            [max(longs) + long_diff, max(lats) + lat_diff],
            [min(longs) - long_diff, min(lats) - lat_diff],
        ]
        context['route_path'] = route_path

        print(long_lat_mapbox_str)
        print(json.dumps(route_path))
        print(json.dumps(map_bounds))

        return render(self.request, self.template_name, context=context)
