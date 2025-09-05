import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import Logo from "./img/Aiqua.webp";
import { supabase } from "./lib/supabaseClients";
import { Menu, X } from "lucide-react";

const planes = [
     {
        nombre: "Freemium",
        usuarios: 1,
        plantas: 1,
        equipos: false,
        normas: 1,
        normasPersonalizadas: false,
        soporte: "48h",
        almacenamiento: "100 MB",
        color: "bg-gray-100",
        destacado: false,
        precios: {
            mensual: 0,
            trimestral: 0,
            semestral: 0,
            anual: 0
        }
    },
    {
        nombre: "Basic",
        usuarios: 3,
        plantas: 3,
        equipos: true,
        normas: 1,
        normasPersonalizadas: false,
        soporte: "48h",
        almacenamiento: "500 MB",
        color: "bg-[#29ABE2]/10",
        destacado: false,
        precios: {
            mensual: 29,
            trimestral: 75, // Aprox. 25/mes
            semestral: 135, // Aprox. 22.5/mes
            anual: 240 // 20/mes
        }
    },
    {
        nombre: "Advanced",
        usuarios: 6,
        plantas: 5,
        equipos: true,
        normas: 2,
        normasPersonalizadas: false,
        soporte: "24h",
        almacenamiento: "5 GB",
        color: "bg-[#29ABE2]/20",
        destacado: true,
        precios: {
            mensual: 59,
            trimestral: 153, // Aprox. 51/mes
            semestral: 275, // Aprox. 45.8/mes
            anual: 480 // 40/mes
        }
    },
    {
        nombre: "Professional",
        usuarios: 10,
        plantas: 12,
        equipos: true,
        normas: 3,
        normasPersonalizadas: true,
        soporte: "12h",
        almacenamiento: "10 GB",
        color: "bg-[#29ABE2]/30",
        destacado: false,
        precios: {
            mensual: 99,
            trimestral: 258, // Aprox. 86/mes
            semestral: 465, // Aprox. 77.5/mes
            anual: 828 // 69/mes
        }
    },
    {
        nombre: "Enterprises",
        usuarios: "Personalizado",
        plantas: "Personalizado",
        equipos: true,
        normas: "Personalizado",
        normasPersonalizadas: true,
        soporte: "Personalizado",
        almacenamiento: "Personalizado",
        color: "bg-[#29ABE2]/40",
        destacado: false,
        precios: {
            mensual: "Consultar",
            trimestral: "Consultar",
            semestral: "Consultar",
            anual: "Consultar"
        }
    }
];

const API_BASE_URL = import.meta.env.VITE_URL;

// Función para obtener planes de la API y combinarlos con los estáticos
const obtenerPlanesCombinados = async () => {
    try {
        const respuesta = await fetch(
            // `https://treea-plantas-tratamiento-api.vercel.app/v1/plans/list`
            `${API_BASE_URL}/v1/plans/list`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error al obtener planes de la API");
        }

        const datos = await respuesta.json();
        console.log("Datos obtenidos de la API:", datos.data);
        // datos es un array de objetos { recurrent, plans }
        // Creamos un objeto para acceder fácil por recurrencia
        const planesPorRecurrencia = {};
        datos.data.forEach(({ recurrent, plans }) => {
            planesPorRecurrencia[recurrent] = plans;
        });

        // Combinamos los planes estáticos con los datos de la API por recurrencia
        return planes.map((plan, index) => {
            // Buscamos el plan por nombre en cada recurrencia
            const combinaciones = {};
            Object.keys(planesPorRecurrencia).forEach((rec) => {
                const apiPlan = planesPorRecurrencia[rec].find(p => p.title === plan.nombre);
                combinaciones[rec] = apiPlan
                    ? { id: apiPlan._id, precio: apiPlan.price }
                    : { id: `fallback-id-${index}`, precio: plan.precios[rec] };
            });
            return {
                ...plan,
                api: combinaciones // { mensual: {id, precio}, ... }
            };
        });
    } catch (error) {
        console.error("Error al obtener planes:", error);
        // Si hay error, devolvemos los planes estáticos con IDs de fallback
        return planes.map((plan, index) => ({
            ...plan,
            api: {
                mensual: { id: `fallback-id-${index}`, precio: plan.precios.mensual },
                trimestral: { id: `fallback-id-${index}`, precio: plan.precios.trimestral },
                semestral: { id: `fallback-id-${index}`, precio: plan.precios.semestral },
                anual: { id: `fallback-id-${index}`, precio: plan.precios.anual }
            }
        }));
    }
};

// Componente para el selector de recurrencia
const SelectorRecurrencia = ({ recurrencia, setRecurrencia }) => {
    const opciones = [
        { valor: "mensual", etiqueta: "Mensual", descuento: "" },
        { valor: "trimestral", etiqueta: "Trimestral", descuento: "-15%" },
        { valor: "semestral", etiqueta: "Semestral", descuento: "-25%" },
        { valor: "anual", etiqueta: "Anual", descuento: "-35%" }
    ];

    return (
        <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg shadow-md p-1 flex">
                {opciones.map((opcion) => (
                    <button
                        key={opcion.valor}
                        onClick={() => setRecurrencia(opcion.valor)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            recurrencia === opcion.valor
                                ? "bg-[#29ABE2] text-white"
                                : "text-gray-600 hover:text-[#29ABE2]"
                        }`}
                    >
                        <span>{opcion.etiqueta}</span>
                        {/* {opcion.descuento && (
                            <span className="text-xs ml-1 bg-[#7AC943] text-white px-1 py-0.5 rounded-full">
                                {opcion.descuento}
                            </span>
                        )} */}
                    </button>
                ))}
            </div>
        </div>
    );
};


export default function LandingAiqua() {

    const [planes, setPlanes] = useState([]);
    const [recurrencia, setRecurrencia] = useState("mensual");
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: null,
        plan: ""
    });
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        
        const cargarPlanes = async () => {
            const planesCombinados = await obtenerPlanesCombinados();
            setPlanes(planesCombinados);
            
            // Seleccionar "Advanced" por defecto si existe
            const planAdvanced = planesCombinados.find(p => p.nombre === "Advanced");
            if (planAdvanced) {
                setPlanSeleccionado(planAdvanced.nombre);
            }
        };
        
        cargarPlanes();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { error } = await supabase.from("Datos").insert([formData])
        if (error) {
            console.error("Error al guardar Datos:", error)
            alert("Hubo un error, inténtalo más tarde.")
        } else {
            alert("¡Gracias! Nos pondremos en contacto pronto.")
            setFormData({ nombre: "", apellido: "", correo: "", telefono: "" })
        }
    }

    // Función para formatear precios
    const formatearPrecio = (precio, recurrencia) => {
        if (typeof precio === "string") return precio;

        const simbolos = {
            mensual: "/mes",
            trimestral: "/trim",
            semestral: "/sem",
            anual: "/año"
        };

        return `$${precio.toLocaleString('es-CO')}${simbolos[recurrencia]}`;
    };

    return (
        <div className="w-full bg-gray-50 text-[#4D4D4D] font-sans overflow-x-hidden">
            {/* Navbar */}
            <nav className="bg-black shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <img src={Logo} alt="Logo Aiqua" className="w-35 rounded" />

                    {/* Desktop nav */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <a href="#contacto" className="text-white hover:text-[#00AEEF] transition font-medium">Comienza ahora</a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-white hover:text-[#00AEEF] transition"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile nav */}
                {menuOpen && (
                    <div className="md:hidden bg-black px-6 pb-4 space-y-4 text-white">
                        <a href="#contacto" className="block hover:text-[#00AEEF] font-medium transition" onClick={() => setMenuOpen(false)}>Comienza ahora</a>
                    </div>
                )}
            </nav>

            {/* HERO */}
            <section className="relative bg-gradient-to-r from-[black] to-[gray] text-white py-30 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1689983828761-1e9383e4f3e4?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
                </div>
                <div className="relative z-10 container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <motion.h1
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-4xl md:text-5xl lg:text-5xl font-bold mb-6 leading-tight"
                            >
                                <strong className="text-[#7AC943]">AIQUA Pool:</strong> la forma más inteligente de operar y cuidar tu piscina
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-lg md:text-xl mb-8 text-white/80"
                            >
                                Monitorea la calidad del agua, optimiza el uso de productos químicos y gestiona toda tu operación  desde una sola plataforma digital.
                                <br />
                                <strong>Reduce errores, gana eficiencia y garantiza la seguridad de tus piscinas.</strong>
                            </motion.p>
                            <div className="flex flex-wrap gap-4">
                                <a href="#comienza-ahora" className="bg-[#7AC943] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-[#6ab83a] transition-all transform hover:-translate-y-1">
                                    Empieza gratis hoy y transforma tu operación
                                </a>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <iframe
                                    src="https://www.youtube.com/embed/a8LIW46N8K4"
                                    title="Aiqua - Video de presentación"
                                    className="w-120 h-80 rounded-lg shadow-lg"
                                    allowFullScreen
                                ></iframe>
                            </motion.div>
                        </div>
                    </div>
                </div>
                <div className="wave-container">
                    <div className="wave wave1"></div>
                    <div className="wave wave2"></div>
                </div>
            </section>

            {/* ¿Qué es Aiqua? */}
            <section id="que-es" className="relative py-20 px-6 bg-white">
                <div className="absolute inset-0 opacity-70">
                    <div className="absolute bottom-0 w-full h-5 bg-gradient-to-b from-transparent to-[darkwhite]"></div>
                </div>

                <div className="container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div data-aos="fade-right">
                            <img
                                src="https://images.unsplash.com/photo-1625844393947-27ed2fa505af?q=80&w=1072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Plataforma Aiqua"
                                className="rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        </div>

                        <div data-aos="fade-left" className="text-left">
                            <h2 className="text-3xl font-bold mb-6 text-[#7AC943] text-center">¿Qué es Aiqua?</h2>
                            {/* <p className="text-lg mb-6">
                                <strong>La forma más sencilla y poderosa de gestionar tus plantas de tratamiento.</strong>
                            </p> */}
                            <p className="text-lg mb-6">
                                <strong>AIQUA Pool</strong> es la app que te permite tener el control total de tus piscinas desde cualquier lugar. Desde la calidad del agua hasta el control de inventarios y mantenimiento de equipos, todo está al alcance de tu mano en una plataforma simple, intuitiva y profesional.
                                <br />
                                <br />
                                Controla parámetros como pH, cloro, ácido cianúrico y alcalinidad, recibe alertas automáticas cuando algo se sale de los rangos ideales, obtén sugerencias de dosificación en tiempo real, y genera reportes instantáneos para uso interno o auditorías.
                            </p>

                            {/* Grid de funcionalidades */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {[
                                    { label: "Parámetros", icon: "https://cdn-icons-png.flaticon.com/512/4501/4501001.png" },
                                    { label: "Dosificación", icon: "https://cdn-icons-png.flaticon.com/512/1798/1798587.png" },
                                    { label: "Normativas", icon: "https://cdn-icons-png.flaticon.com/512/18455/18455574.png" },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center border border-[#00AEEF] rounded-md px-3 py-2 bg-white shadow-sm hover:shadow-md transition"
                                    >
                                        <img src={item.icon} alt={item.label} className="w-6 h-6 mr-2" />
                                        <span className="text-sm font-medium text-gray-800">{item.label}</span>
                                    </div>
                                ))}

                                {/* Segunda fila centrada */}
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-center gap-4">
                                    {[
                                        { label: "Inventarios", icon: "https://cdn-icons-png.flaticon.com/512/2897/2897763.png" },
                                        { label: "Mantenimiento", icon: "https://cdn-icons-png.flaticon.com/512/2244/2244413.png" },
                                    ].map((item, i) => (
                                        <div
                                            key={`extra-${i}`}
                                            className="flex items-center justify-start sm:justify-center border border-[#00AEEF] rounded-md px-3 py-2 bg-white shadow-sm hover:shadow-md transition w-full sm:w-44"
                                        >
                                            <img src={item.icon} alt={item.label} className="w-6 h-6 mr-2" />
                                            <span className="text-sm font-medium text-gray-800">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Mensaje azul */}
            <section className="bg-white ">
                <div className="p-6 bg-[#00AEEF] text-white shadow-md text-lg mb-4" data-aos="fade-up">
                    <p><strong>Aiqua Pool</strong></p>
                    <p>
                        automatiza y centraliza todo lo necesario para garantizar una piscina operativa, higiénica y segura.
                    </p>
                </div>
            </section>

            {/* Principales ventajas */}
            <section className="relative py-20 px-6 bg-black">
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569614881478-972dc9ff6487?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-transparent to-[white]"></div>
                </div>
                <div className="container" data-aos="fade-up">
                    <h2 className="text-3xl font-bold mb-12 text-[white] text-center">Beneficios claves</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Tarjeta 1 - Control rápido */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/7068/7068006.png" alt="control" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">MONITOREO COMPLETO DE CALIDAD  DEL AGUA</h3>
                                <p className="text-gray-600 flex-grow">pH, cloro, ácido cianúrico, alcalinidad, entre otros.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>

                        </div>

                        {/* Tarjeta 2 - Inventarios */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/9638/9638986.png" alt="inventario" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">DOSIFICACION INTELIGENTE</h3>
                                <p className="text-gray-600 flex-grow">Sugerencias automáticas basadas en las condiciones reales del agua.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>
                        </div>

                        {/* Tarjeta 3 - Dosificación */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/3151/3151261.png" alt="dosificacion" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">GESTION DE INVENTARIO DE PRODUCTOS QUIMICOS</h3>
                                <p className="text-gray-600 flex-grow">Controla lo que tienes y evita faltantes.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>
                        </div>

                        {/* Tarjeta 4 - Recomendaciones */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/12574/12574681.png" alt="recomendaciones" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">CONTROL DE EQUIPOS</h3>
                                <p className="text-gray-600 flex-grow">Historial, fichas técnicas y mantenimientos programados.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>
                        </div>

                        {/* Tarjeta 5 - Gestión técnica */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/4233/4233834.png" alt="respaldo" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">RESPORTES AUTOMATICOS</h3>
                                <p className="text-gray-600 flex-grow">Listos para auditorías o revisión interna.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>
                        </div>

                        {/* Tarjeta 6 - Plaguicidas */}
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="flex flex-col h-full items-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/2979/2979851.png" alt="plaguicidas" className="h-14 w-14 mb-4" />
                                <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">MULTI-SITIO</h3>
                                <p className="text-gray-600 flex-grow">Controlar múltiples piscinas desde un único panel.</p>
                                <div className="mt-4 w-16 h-1 bg-[#7AC943]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ¿Dónde aplicar? */}
            <section className="py-20 px-6 bg-[white]">
                <div className="container text-center" data-aos="fade-up">
                    <h2 className="text-3xl font-bold mb-12 text-[#00AEEF]">¿Quién puede usar Agriqua?</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-20 h-20 mb-6 bg-[#29ABE2]/10 rounded-full flex items-center justify-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/2395/2395796.png" alt="Ganadería" className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#29ABE2] uppercase">Propietarios de piscinas residenciales</h3>
                            <p className="text-gray-600">Que quieren una piscina segura sin complicaciones.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-20 h-20  mb-6 bg-[#29ABE2]/10 rounded-full flex items-center justify-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/7862/7862939.png" alt="Agricultura" className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#29ABE2] uppercase">Hoteles y centros vacacionales</h3>
                            <p className="text-gray-600">Que cuidan la experiencia de sus huéspedes.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-20 h-20  mb-6 bg-[#29ABE2]/10 rounded-full flex items-center justify-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/3319/3319245.png" alt="Avícola" className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#29ABE2] uppercase"> Clubes deportivos y recreativos</h3>
                            <p className="text-gray-600">Que necesitan eficiencia y control.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-20 h-20  mb-6 bg-[#29ABE2]/10 rounded-full flex items-center justify-center">
                                <img src="https://cdn-icons-png.flaticon.com/512/3319/3319245.png" alt="Avícola" className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#29ABE2] uppercase">Empresas operadoras</h3>
                            <p className="text-gray-600">Con piscinas en múltiples ubicaciones.</p>
                        </div>
                    </div>
                    <div className="mt-10">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold italic ">
                            “Impulsa tu producción con herramientas que mejoran la eficiencia y protegen el medio ambiente.”
                        </h1>
                    </div>
                </div>
            </section>

            {/* ¿Cómo funciona? */}
            <section className="relative py-20 px-6 bg-black text-black">
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1694858473750-1802e14ac2f4?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-transparent to-[white]"></div>
                </div>
                <div className="container " data-aos="fade-up">
                    <h2 className="text-3xl font-bold mb-12 text-white text-center">¿Cómo funciona?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
                        {/* Primeros 3 pasos */}
                        {[
                            {
                                number: 1,
                                title: "Crea tu piscina",
                                text: "Ingresa los datos básicos  sobre tu piscina.",
                            },
                            {
                                number: 2,
                                title: "Agrega tus productos químicos",
                                text: "Registra los productos que usas y lleva el control del inventario.",
                            },
                            {
                                number: 3,
                                title: "Registra los datos operativos",
                                text: "Toma lecturas y guarda los resultados para monitorear tu operación.",
                            },
                        ].map(({ number, title, text }) => (
                            <div
                                key={number}
                                className="bg-white p-5 rounded-3xl border h-full w-full border-[#7AC943] shadow-md text-center flex flex-col items-center"
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-lg rotate-45 border-2 border-[#7AC943] text-[#7AC943] font-bold mb-4">
                                    <div className="-rotate-45">{number}</div>
                                </div>
                                <h3 className="text-lg font-bold text-[#00AEEF] mb-2 uppercase">{title}</h3>
                                <p className="text-sm">{text}</p>
                            </div>
                        ))}

                        {/* Fila inferior centrada: pasos 4 y 5 */}
                        <div className="col-span-1 md:col-span-3 flex flex-col sm:flex-row justify-center items-center gap-8 w-full">
                            {[
                                {
                                    number: 4,
                                    title: "Recibe alertas y sugerencias automáticas ",
                                    text: "Te avisamos si algo no está en los rangos ideales y te decimos qué hacer.",
                                },
                                {
                                    number: 5,
                                    title: "Toma decisiones con seguridad",
                                    text: "Actúa con tranquilidad: tienes toda la información al alcance de tu mano.",
                                },
                            ].map(({ number, title, text }) => (
                                <div
                                    key={number}
                                    className="bg-white p-5 rounded-3xl border border-[#7AC943] shadow-md text-center flex flex-col items-center max-w-sm w-full"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-lg rotate-45 border-2 border-[#7AC943] text-[#7AC943] font-bold mb-4">
                                        <div className="-rotate-45">{number}</div>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#00AEEF] mb-2 uppercase">{title}</h3>
                                    <p className="text-sm">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </section>

            {/* Planes */}
            <section id="planes" className="py-20 px-6 bg-white">
                <div className="text-center" data-aos="fade-up">
                    <h2 className="text-3xl font-bold mb-4 text-[#00AEEF]">Planes</h2>
                    <p className="text-center text-lg text-gray-600 mb-4">Elige el plan que mejor se adapte a las necesidades de tu empresa</p>

                    {/* Selector de recurrencia */}
                    <SelectorRecurrencia recurrencia={recurrencia} setRecurrencia={setRecurrencia} />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {planes.length > 0 ? planes.map((plan) => {
                            const esSeleccionado = plan.nombre === planSeleccionado;
                            const esAdvanced = plan.nombre === "Advanced";
                            const esSeleccionadoPorDefecto = !planSeleccionado && esAdvanced;
                            // Usamos los datos de la API según la recurrencia
                            const { id, precio } = plan.api[recurrencia];

                            return (
                                <div
                                    key={id}
                                    className={`${plan.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${(esSeleccionado || esSeleccionadoPorDefecto) ? 'transform -translate-y-4 border-2 border-[#7AC943] relative' : ''
                                        }`}
                                    onClick={() => setPlanSeleccionado(plan.nombre)}
                                >
                                    {(esSeleccionado || esSeleccionadoPorDefecto) && (
                                        <div className="absolute -top-4 left-0 right-0 mx-auto w-max px-4 py-1 bg-[#7AC943] text-white font-bold rounded-full text-sm">
                                            {esAdvanced ? "Más popular" : "Seleccionado"}
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold mb-4 text-[#29ABE2]">{plan.nombre}</h3>

                                    {/* Precio según recurrencia */}
                                    <div className="mb-4">
                                        <div className="text-2xl font-bold text-gray-800">
                                            {formatearPrecio(precio, recurrencia)}
                                        </div>
                                        {/* {recurrencia !== "mensual" && typeof precio === "number" && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                Ahorras {Math.round((1 - (precio / (plan.precios.mensual *
                                                    (recurrencia === "trimestral" ? 3 :
                                                        recurrencia === "semestral" ? 6 : 12)))) * 100)}%
                                            </div>
                                        )} */}
                                    </div>

                                    <ul className="text-left space-y-3 mb-6">
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">👥</span>
                                            <span>Usuarios: <strong>{plan.usuarios}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">🏭</span>
                                            <span>Plantas: <strong>{plan.plantas}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">⚙️</span>
                                            <span>Equipos: <strong>{plan.equipos ? "Sí" : "No"}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">📜</span>
                                            <span>Normas: <strong>{plan.normas}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">🛠️</span>
                                            <span>Normas personalizadas: <strong>{plan.normasPersonalizadas ? "Sí" : "No"}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">📩</span>
                                            <span>Soporte: <strong>{plan.soporte}</strong></span>
                                        </li>
                                        <li className="flex items-center">
                                            <span className="mr-2 text-[#00AEEF]">💾</span>
                                            <span>Almacenamiento: <strong>{plan.almacenamiento}</strong></span>
                                        </li>
                                    </ul>

                                    <a
                                        href={`http://localhost:5174/?plan=${id}`}
                                        onClick={(e) => {
                                            if (!(esSeleccionado || esSeleccionadoPorDefecto)) {
                                                e.preventDefault();
                                                setPlanSeleccionado(plan.nombre);
                                            }
                                        }}
                                        className={`block text-center mt-4 font-bold py-2 px-4 rounded-full transition-all
                                            ${(esSeleccionado || esSeleccionadoPorDefecto)
                                                ? "bg-[#7AC943] text-white hover:bg-[#6ab83a]"
                                                : "bg-gray-300 text-gray-600 cursor-pointer"}
                                                `}
                                    >
                                        {precio === 0 ? "Comenzar gratis" : "Adquirir este plan"}
                                    </a>
                                </div>
                            );
                        }) : (
                            <div className="col-span-5 text-center py-10">
                                <p>Cargando planes...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>


            {/* Comienza ahora */}
            <section id="comienza-ahora" className="relative bg-[black] py-20 px-6">
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1713965590812-03afe5c150f9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover z-0"></div>
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-transparent to-[#4D4D4D]"></div>
                </div>
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-left" data-aos="fade-right">
                            <h3 className="text-3xl font-bold mb-6 text-white">
                                <strong className="text-[#7AC943]">Revoluciona</strong> la operación de tus plantas de tratamiento
                            </h3>

                            <ul className="space-y-4 text-white">
                                <li>
                                    <span className="text-[#7AC943] font-bold mr-2">✓</span>
                                    <span>Supervisa, controla y optimiza en un solo lugar.</span>
                                </li>
                                <li>
                                    <span className="text-[#7AC943] font-bold mr-2">✓</span>
                                    <span>Aumenta la eficiencia y asegura el cumplimiento normativo.</span>
                                </li>
                                <li>
                                    <span className="text-[#7AC943] font-bold mr-2">✓</span>
                                    <span>Reduce riesgos y toma decisiones basadas en datos.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="text-right" data-aos="fade-left">
                            <div className="max-w-md mx-auto bg-white border-2 border-blue-300 rounded-2xl shadow-lg p-6">
                                <h4 className="text-center text-xl font-semibold text-gray-800 mb-4">Comienza Ahora</h4>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        name="nombre"
                                        onChange={handleChange}
                                        value={formData.nombre}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellido"
                                        name="apellido"
                                        onChange={handleChange}
                                        value={formData.apellido}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo"
                                        name="correo"
                                        onChange={handleChange}
                                        value={formData.correo}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Teléfono"
                                        name="telefono"
                                        onChange={handleChange}
                                        value={formData.telefono}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <div className="flex items-center text-sm text-gray-600">
                                        <input type="checkbox" id="terms" className="mr-2" />
                                        <label htmlFor="terms">
                                            Acepto los{" "}
                                            <a href="#" className="text-blue-600 hover:underline">
                                                Términos y condiciones
                                            </a>.
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-md hover:scale-105 transition-transform"
                                    >
                                        Recibir demo
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="bg-[white] py-15 px-6 text-center overflow-hidden">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-extrabold mb-6 leading-snug">
                        AIQUA Pool
                    </h2>

                    <p className="mb-6 text-lg leading-relaxed">
                        es tu aliado para una gestión moderna, segura y eficiente de piscinas.
                        Reduce costos, evita errores y asegura la mejor calidad del agua.
                        Empieza gratis hoy y lleva tu operación al siguiente nivel.
                    </p>

                    <p className="mb-8 text-lg leading-relaxed">
                        Por eso en Tree-A desarrollamos Aiqua para que puedas hacer un seguimiento fácil
                        y efectivo de los aspectos clave de tu operación.
                    </p>

                    <a
                        href="https://wa.me/573225100966?text=Hola%20Tree-a,%20estoy%20interesado%20en%20la%20aplicación%20para%20el%20seguimiento%20de%20mis%20plantas%20de%20tratamiento."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#7AC943] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-[#6ab83a] transition-all duration-300"
                    >
                        📱 Escríbenos por WhatsApp
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#4D4D4D] text-white py-6 text-center">
                <p>© 2025 AIQUA - Desarrollado por Tree-a</p>
            </footer>
        </div>
    );
}