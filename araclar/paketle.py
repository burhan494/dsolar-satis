#!/usr/bin/env python3
"""D Solar güncelleme paketi üretir ve imzalar.
Kullanım: python3 araclar/paketle.py SURUM "kısa not" /yol/imza-ozel.pem
Çıktı: surumler/dsolar-SURUM.zip ve surumler/manifest.json
Paket yalnız app/pb_public ve app/pb_migrations içerir. Gizli anahtar depoya KONMAZ.
"""
import sys, os, json, zipfile, hashlib, base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
kok = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
surum, not_, anahtar = int(sys.argv[1]), sys.argv[2], sys.argv[3]
izin = {".html", ".js", ".css", ".json", ".png", ".svg", ".ico", ".webmanifest", ".txt"}
yol = os.path.join(kok, "surumler", f"dsolar-{surum}.zip")
with zipfile.ZipFile(yol, "w", zipfile.ZIP_DEFLATED) as z:
    for d in ("pb_public", "pb_migrations"):
        for kd, _, dosyalar in os.walk(os.path.join(kok, "app", d)):
            for f in sorted(dosyalar):
                if os.path.splitext(f)[1].lower() not in izin: raise SystemExit("izin verilmeyen dosya: " + f)
                tam = os.path.join(kd, f); z.write(tam, os.path.relpath(tam, os.path.join(kok, "app")))
ozet = hashlib.sha256(open(yol, "rb").read()).hexdigest()
k = serialization.load_pem_private_key(open(anahtar, "rb").read(), password=None)
imza = base64.b64encode(k.sign(f"dsolar|{surum}|{ozet}".encode(), padding.PKCS1v15(), hashes.SHA256())).decode()
json.dump({"surum": surum, "paket": f"surumler/dsolar-{surum}.zip", "sha256": ozet, "imza": imza, "not": not_}, open(os.path.join(kok, "surumler", "manifest.json"), "w"), ensure_ascii=False, indent=1)
print(yol, ozet)
