# Django Boilerplate Template

Quick start Django 2.2 project template.

# Usage

```bash
git clone https://github.com/yat-co/django_map
```

Add .env file with following format, adding random string to Secret Key and Mapbox Private Key
```
SECRET_KEY=

DEBUG=True
ALLOWED_HOSTS=127.0.0.1

MAPBOX_API_KEY=
```

Install Requirements
```
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Run migrations
```
python manage.py migrate
```

You are off to the races!

```
make
```