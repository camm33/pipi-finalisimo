import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";


import Home from "./Home";
import Iniciar from "./IniciarSesion";
import Agregar from "./AgregarPublicacion";
import Editar from "./editar_perfil";
import Register from "./register";
import MiPerfil from "./MiPerfil";
import DetallePrenda from "./DetallePrenda";
import AdminDashboard from "./AdminDashboard";
import ListaDeDeseos from "./ListaDeDeseos";
import AppPerfiles from "./perfiles";
import GestionarPrenda from "./GestionPublicaciones";
import GestionPrendasAdmin from "./GestionPrendasAdmin";
import GestionarPublicacionesAdmin from "./GestionarPublicacionesAdmin";
import GestionUsuarios from "./GestionUsuarios";
import GestionPagos from "./GestionPagos";
import Configuracion from "./Configuracion";
import Verificar from "./Verificar";
import MensajeAdmin from "./MensajeAdmin";
import RecuperarContrasena from "./RecuperarContrasena";
import RestablecerContrasena from "./RestablecerContrasena";
import PoliticasSeguridad from "./PoliticasSeguridad";
import PreguntasFrecuentes from "./PreguntasFrecuentes";
import Contactanos from "./Contactanos";
import ChatList from "./ChatList";

import Header from "./Header";
import HeaderAdmin from "./HeaderAdmin";
import Footer from "./Footer";
import PublicHeader from "./PublicHeader";

// 🔒 Rutas privadas
function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/iniciar" />;
}

// Rutas públicas
function PublicRoute({ isLoggedIn, children, redirectTo = "/" }) {
  return !isLoggedIn ? children : <Navigate to={redirectTo} />;
}

// Rutas para Admin
function AdminRoute({ isLoggedIn, children }) {
  const idRol = localStorage.getItem("id_rol");
  return isLoggedIn && (idRol === "1" || idRol === 1)
    ? children
    : <Navigate to="/iniciar" />;
}

// 🔹 Nueva ruta para usuarios normales (evita que admin acceda a catálogo)
function UserRoute({ isLoggedIn, children }) {
  const idRol = localStorage.getItem("id_rol");
  return isLoggedIn && (idRol === "2" || idRol === 2) // asumo que el rol 2 = usuario normal
    ? children
    : <Navigate to="/" />;
}

// 📦 Layout general
function Layout({ header, children }) {
  return (
    <>
      {header}
      {children}
      <Footer />
    </>
  );
}

// Layout especial para Admin (sin botón de chat)
function AdminLayout({ header, children }) {
  return (
    <>
      {header}
      {children}
      <Footer />
    </>
  );
}

// � Componente para redirección automática basada en rol
function RootRedirect() {
  const token = localStorage.getItem("token");
  const idRol = localStorage.getItem("id_rol");
  
  if (!token) {
    // No está logueado, mostrar Home público
    return (
      <Layout header={<PublicHeader />}>
        <Home />
      </Layout>
    );
  }
  
  // Está logueado, redirigir según rol
  if (idRol === "1" || idRol === 1) {
    return <Navigate to="/AdminDashboard" replace />;
  } else {
    return <Navigate to="/catalogo" replace />;
  }
}

// �🚀 App principal
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="App">
      <main>
        <Routes>

            {/* 🏠 Página principal */}
            <Route
              path="/"
              element={<RootRedirect />}
            />

            {/* 🛍️ Catálogo → solo usuarios normales */}
            <Route
              path="/catalogo"
              element={
                <UserRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Home />
                  </Layout>
                </UserRoute>
              }
            />

            {/* 📝 Registro */}
            <Route
              path="/register"
              element={
                <PublicRoute isLoggedIn={isLoggedIn}>
                  <Register setIsLoggedIn={setIsLoggedIn} />
                </PublicRoute>
              }
            />
             {/* Verificar */}
<Route
  path="/verificar"
  element={
    <PublicRoute isLoggedIn={isLoggedIn}>
      <Verificar />
    </PublicRoute>
  }
/>

            {/* 🔐 Iniciar sesión */}
            <Route
              path="/iniciar"
              element={
                <PublicRoute isLoggedIn={isLoggedIn}>
                  <Iniciar setIsLoggedIn={setIsLoggedIn} />
                </PublicRoute>
              }
            />

            {/* 👤 Mi perfil */}
            <Route
              path="/MiPerfil"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <MiPerfil />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* ➕ Agregar publicación */}
            <Route
              path="/agregar"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Agregar />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* ✏️ Editar perfil */}
            <Route
              path="/editar"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Editar />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* 👗 Detalle prenda */}
            <Route
              path="/detalle_prenda/:id"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <DetallePrenda />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* 💖 Lista de deseos */}
            <Route
              path="/lista_deseos"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <ListaDeDeseos />
                  </Layout>
                </PrivateRoute>
              }
            />


            {/* ⚙️ Configuración */}
            <Route
              path="/configuracion"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Configuracion />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Políticas de seguridad */}
            <Route
              path="/politicas-seguridad"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <PoliticasSeguridad />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Preguntas frecuentes */}
            <Route
              path="/preguntas-frecuentes"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <PreguntasFrecuentes />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Contáctanos */}
            <Route
              path="/contactanos"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Contactanos />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* � Chat */}
            <Route
              path="/chat"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <ChatList />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* �👥 Ver perfil de otro usuario */}
            <Route
              path="/perfil/:id_usuario"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <AppPerfiles />
                  </Layout>
                </PrivateRoute>
              }
            />


            {/* 🧑‍💼 Panel de administrador */}
            <Route
              path="/AdminDashboard"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* ✉️ Enviar mensaje (Admin) */}
            <Route
              path="/AdminDashboard/mensaje"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <MensajeAdmin />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Gestión de prendas (Admin) */}
            <Route
              path="/AdminDashboard/gestion-prendas"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionPrendasAdmin />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Gestión de usuarios (Admin) */}
            <Route
              path="/AdminDashboard/usuarios"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionUsuarios />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Gestión de pagos (Admin) */}
            <Route
              path="/AdminDashboard/pagos"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionPagos />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Editar publicación desde Admin */}
            <Route
              path="/AdminDashboard/editar_publicacion/:id"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <AdminLayout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionarPublicacionesAdmin />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/gestion_prendas/:id"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionarPrenda />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* 🔁 Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
  );
}

export default App;
