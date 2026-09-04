# ShopEase — Django + React E-Commerce App

A full-stack e-commerce web application built with **Django REST Framework** (backend) and **React.js** (frontend), featuring JWT authentication, product catalog, cart management, checkout, and **Razorpay payment integration**.

The application supports secure JWT-based authentication, product browsing, shopping cart management, order creation, Razorpay checkout, payment verification, and paid order tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (Django ORM) |
| Frontend | React.js, React Router, React Context API |
| HTTP Client | Axios (with interceptors for JWT + auto token refresh) |
| Payment Gateway | Razorpay |
| Notifications | React Toastify |
| CORS | django-cors-headers |
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
| POST | `/api/orders/payment/create/` | Create Razorpay payment order |
| POST | `/api/orders/payment/verify/` | Verify Razorpay payment signature |

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

## Razorpay Payment Integration

Razorpay is integrated into the checkout flow for secure online payments.

### Payment Flow

1. User adds products to the cart.
2. User enters shipping details during checkout.
3. Django creates the order.
4. Django creates a Razorpay order using the Razorpay API.
5. React opens the Razorpay Checkout popup.
6. User completes the payment.
7. Razorpay returns the payment ID, order ID, and signature.
8. React sends the payment details to the Django backend.
9. Django verifies the Razorpay payment signature.
10. The order is marked as paid after successful verification.

```text
React Checkout
      ↓
Create Django Order
      ↓
Create Razorpay Order
      ↓
Razorpay Checkout
      ↓
Payment
      ↓
Payment ID + Signature
      ↓
Django Payment Verification
      ↓
Order Marked as Paid

## Resume-Ready Description

> Built a full-stack e-commerce web application using Django REST Framework and
> React.js, featuring JWT-based authentication, a product catalog with category
> filtering and search, cart management, and order checkout. Designed relational
> models (Product, Category, Cart, Order) using Django ORM with SQLite, and built
> a responsive React frontend using Context API for global auth/cart state and
> Axios interceptors for automatic JWT token refresh.

**Technologies:** Python, JavaScript, Django, Django REST Framework, React.js,
React Router, React Context API, Axios, JWT Authentication, SQLite, django-cors-headers
