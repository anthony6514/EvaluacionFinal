const firebaseConfig = {
  apiKey: "AIzaSyDN_TlIs4PrgPNmiC53u6JqjXp0H4cnLGs",
  authDomain: "ea-store-f5e54.firebaseapp.com",
  projectId: "ea-store-f5e54",
  storageBucket: "ea-store-f5e54.firebasestorage.app",
  messagingSenderId: "349134442254",
  appId: "1:349134442254:web:39381c249e0132c0ab515f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const agregarEvento = async (nombre, fecha, hora, descripcion, imagen) => {
    const eventosSnapshot = await db.collection("eventos").get();
    const existe = eventosSnapshot.docs.some(doc => {
        const data = doc.data();
        return data.nombre === nombre && data.fecha === fecha;
    });

    if (existe) {
        alert("Ya existe un evento con ese nombre en esa fecha.");
        return;
    }

    await db.collection("eventos").add({ nombre, fecha, hora, descripcion, imagen });
    await cargarEventos();
}

const cargarEventos = async () => {
    const lista = document.getElementById('lista-eventos');
    lista.innerHTML = "";

    let filtro = document.getElementById('filtro-fecha').value;
    let ref = db.collection("eventos");
    const eventos = await ref.get();

    let docs = eventos.docs;
    if (filtro) {
        docs = docs.filter(doc => doc.data().fecha === filtro);
    }

    if (docs.length === 0) {
        lista.innerHTML = "<p>No hay eventos para mostrar.</p>";
        return;
    }

    docs.forEach(doc => {
        const evento = doc.data();
        const div = document.createElement('div');
        div.className = "evento";
        div.innerHTML = `
            <strong>${evento.nombre}</strong> <br>
            Fecha: ${evento.fecha} <br>
            Hora: ${evento.hora} <br>
            Descripción: ${evento.descripcion} <br>
        `;
        if (evento.imagen) {
            const img = document.createElement('img');
            img.src = evento.imagen;
            img.alt = "Imagen del evento";
            img.className = "imagen-evento";
            div.appendChild(img);
        }

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "boton";
        btnEliminar.onclick = async () => {
            await db.collection("eventos").doc(doc.id).delete();
            await cargarEventos();
        };
        div.appendChild(btnEliminar);
        div.appendChild(document.createElement("hr"));
        lista.appendChild(div);
    });
}

document.getElementById("form-evento").addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const imagen = document.getElementById("imagen") ? document.getElementById("imagen").value.trim() : "";
    await agregarEvento(nombre, fecha, hora, descripcion, imagen);
    e.target.reset();
});

document.getElementById("filtro-fecha").addEventListener('change', async () => {
    await cargarEventos();
});

window.onload = () => {
    cargarEventos();
}