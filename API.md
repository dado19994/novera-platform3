# Novera API Notes

## Discovery

City discovery accepts the same slugs used by the frontend city selector:

```http
GET /api/discovery/city/rome
GET /api/discovery/city/barcelona
GET /api/discovery/city/berlin
GET /api/discovery/city/copenhagen
GET /api/discovery/city/bari
```

The endpoint responds with the modular discovery payload used by `/api/discovery/home`, filtered to the selected city.

City slugs are globally unique identifiers for discovery routes. Existing numeric city URLs remain supported during the client migration period:

```http
GET /api/discovery/city/1
```

The frontend's `global` option represents unscoped discovery and should use:

```http
GET /api/discovery/home
```
