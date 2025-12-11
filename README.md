
# 📦 Events App — Backend Setup Guide

This guide explains how to configure SQL Server and run the backend locally.

---

## 🔧 1. Install backend dependencies

```bash
cd backend
npm install
```

---

## 🔐 2. Create an environment file

Copy the example file:

```bash
cp .env.example .env
```

Then update `.env` with your actual credentials:

```
SERVER_PORT=4000
CLIENT_ORIGIN=http://localhost:5173

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=EventsDB
DB_USER=events_user
DB_PASSWORD=your_password
```

---

## 🗄️ 3. SQL Server configuration

### ✔ Enable TCP/IP

Open **SQL Server Configuration Manager**:

```
SQL Server Network Configuration → Protocols for MSSQLSERVER
```

Enable **TCP/IP**, then open **Properties → IP Addresses**.

In **IPAll**, set:

```
TCP Dynamic Ports = 0
TCP Port = 1433
```

Restart the service:

```
SQL Server Services → SQL Server (MSSQLSERVER) → Restart
```

---

### ✔ Enable SQL Authentication (Mixed Mode)

In SSMS:

```
Right-click server → Properties → Security
```

Enable:

```
SQL Server and Windows Authentication mode
```

Restart SQL Server again.

---

### ✔ Create a login for the application

In SSMS:

```
Security → Logins → New Login
```

Configure:

* Login name: `events_user`
* SQL Server Authentication
* Set password (same as in `.env`)
* (Optional) Disable password policy
* **User Mapping → EventsDB → db_owner**

---

## 🚀 4. Start the backend server

```bash
cd backend
npm run dev
```

Expected output:

```
✅ Connected to SQL Server
🚀 Server running on port 4000
```

---

## 🎉 Done!

Backend is now up and running and ready for API development.

---

