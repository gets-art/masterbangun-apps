#!/bin/bash
echo "=========================================="
echo " MasterBangun VPS Deployment Setup"
echo "=========================================="
echo ""

# Ask for the public IP or domain
read -p "Masukkan IP Public VPS atau Nama Domain Anda (contoh: 103.45.67.89 atau masterbangun.com): " PUBLIC_IP

if [ -z "$PUBLIC_IP" ]; then
  echo "Error: IP/Domain tidak boleh kosong!"
  exit 1
fi

# Create .env file for docker-compose
echo "NEXT_PUBLIC_API_URL=http://$PUBLIC_IP:3000/api" > .env
echo "DATABASE_URL=file:/app/prisma/data/masterbangun.db" >> .env

echo "Konfigurasi berhasil disimpan! URL API Anda adalah http://$PUBLIC_IP:3000/api"
echo "Sedang membangun dan menjalankan aplikasi melalui Docker Compose..."

# Run docker-compose
docker compose up --build -d

echo ""
echo "=========================================="
echo " DEPLOYMENT SELESAI! 🚀"
echo "=========================================="
echo "Aplikasi Anda sekarang bisa diakses melalui:"
echo "Frontend : http://$PUBLIC_IP"
echo "Backend  : http://$PUBLIC_IP:3000/api"
echo ""
echo "Gunakan akun login yang sudah ada untuk mencoba (misal: mandor@masterbangun.com / mandor123)"
