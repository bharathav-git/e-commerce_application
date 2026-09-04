# ShopEase — Django + React E-Commerce App

A full-stack e-commerce web application built with **Django REST Framework** (backend)
and **React.js** (frontend), featuring JWT authentication, product catalog, cart
management, and order checkout.

> **Note:** Payment gateway integration (e.g. Razorpay) is intentionally **not**
> included yet. Orders are created with `status="pending"` and an empty
> `payment_method`. This is meant to be plugged in later at the checkout step —
> see `orders/views.py` (`OrderListCreateView.create`) for where it hooks in.

---

## Tech Stack

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Backend        | Django, Django REST Framework                            |
| Auth           | JWT (djangorestframework-simplejwt)                       |
| Database       | SQLite (Django ORM)                                       |
| Frontend       | React.js, React Router, React Context API                 |
| HTTP Client    | Axios (with interceptors for JWT + auto token refresh)    |
| Notifications  | React Toastify                                             |
| CORS           | django-cors-headers                                        |

---

## Project Structure

```
ecommerce-project/
├── backend/                 # Django project
│   ├── backend/              # settings, root urls
│   ├── accounts/             # custom user model, JWT register/login/me
│   ├── core/                 # Category & Product models + API
│   ├── orders/               # Cart, CartItem, Order, OrderItem + API
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 # React (Vite) app
    ├── src/
    │   ├── api/axios.js       # axios instance + JWT interceptors
    │   ├── context/           # AuthContext, CartContext
    │   ├── components/        # NavBar
    │   └── pages/             # Home, ProductDetail, Login, Register,
    │                          # Cart, Checkout, Orders, OrderDetail
    └── package.json
```

---

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python3 manage.py migrate
python3 manage.py seed_data        # optional: adds sample categories & products
python3 manage.py createsuperuser  # optional: for /admin access

python3 manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`
Admin panel: `http://127.0.0.1:8000/admin/`

### Key API Endpoints

| Method | Endpoint                              | Description                          |
|--------|-----------------------------------------|---------------------------------------|
| POST   | `/api/accounts/register/`               | Create a new user                     |
| POST   | `/api/accounts/login/`                  | Get JWT access + refresh tokens       |
| POST   | `/api/accounts/login/refresh/`          | Refresh access token                  |
| GET    | `/api/accounts/me/`                     | Get logged-in user's profile          |
| GET    | `/api/categories/`                      | List categories                       |
| GET    | `/api/products/`                        | List products (supports `?category=`, `?search=`, `?ordering=`) |
| GET    | `/api/products/<slug>/`                 | Product detail                        |
| GET    | `/api/orders/cart/`                     | Get current user's cart               |
| POST   | `/api/orders/cart/items/`               | Add item to cart                      |
| PATCH  | `/api/orders/cart/items/<id>/`          | Update cart item quantity             |
| DELETE | `/api/orders/cart/items/<id>/`          | Remove cart item                      |
| GET    | `/api/orders/`                          | List current user's orders            |
| POST   | `/api/orders/`                          | Checkout (creates order from cart)    |
| GET    | `/api/orders/<id>/`                     | Order detail                          |

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173/`

The API base URL is set in `src/api/axios.js` (`http://127.0.0.1:8000/api`) —
update this if your backend runs elsewhere.

---

## Where Payment Integration Will Go Later

- **Backend:** `orders/models.py` already has `payment_method`, `payment_reference`,
  `is_paid`, and `paid_at` fields on the `Order` model, left blank/false by default.
  `orders/views.py` → `OrderListCreateView.create()` is where you'd call out to a
  payment gateway (e.g. Razorpay order creation) after the order is saved.
- **Frontend:** `src/pages/Checkout.jsx` has a placeholder note where the payment
  method selection / gateway checkout button will go.

---

## Resume-Ready Description

> Built a full-stack e-commerce web application using Django REST Framework and
> React.js, featuring JWT-based authentication, a product catalog with category
> filtering and search, cart management, and order checkout. Designed relational
> models (Product, Category, Cart, Order) using Django ORM with SQLite, and built
> a responsive React frontend using Context API for global auth/cart state and
> Axios interceptors for automatic JWT token refresh.

**Technologies:** Python, JavaScript, Django, Django REST Framework, React.js,
React Router, React Context API, Axios, JWT Authentication, SQLite, django-cors-headers
