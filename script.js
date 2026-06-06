/* ================= EMAILJS ================= */
emailjs.init("vfDMWo65SU0WsoANL");
/* ================= LOGIN ================= */
function login() {

let user = document.getElementById("username").value.trim();
let pass = document.getElementById("password").value.trim();

if (user === "admin" && pass === "12345") {

    window.location.href = "dashboard.html";

} else {

    alert("Invalid Username or Password");
}
}

/* ================= TRACK COMPLAINT ================= */

function trackComplaint() {
let id = document.getElementById("complaintId").value.trim();

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let found =
complaints.find(c => c.id === id);

if(found){

    document.getElementById("result").innerHTML = `

    <b>ID:</b> ${found.id}<br>
    <b>Name:</b> ${found.name}<br>
    <b>Phone:</b> ${found.phone}<br>
    <b>District:</b> ${found.district || "-"}<br>
    <b>Ward:</b> ${found.ward || "-"}<br>
    <b>Authority:</b> ${found.authority}<br>
    <b>Location:</b> ${found.location}<br>
    <b>Status:</b> ${found.status}<br>
    <b>Date:</b> ${found.date}
    <b>Email:</b> ${found.email || "-"}<br>
    `;

}else{

    document.getElementById("result").innerHTML =
    "❌ Complaint Not Found";
}}

/* ================= LOCATION ================= */

function getLocation() {

let status = document.getElementById("status");

if(!navigator.geolocation){

    alert("Location Service Not Supported");
    return;
}

status.innerHTML = "📡 Getting Location...";

navigator.geolocation.getCurrentPosition(

    async function(position){

        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        let address =
        await getAddressFromCoords(lat,lng);

        document.getElementById("location").value =
        address;

        extractDistrict(address);

        status.innerHTML =
        "✅ Location Captured";

    },

    function(){

        alert(
        "⚠ Please Turn ON GPS & Allow Location Permission."
        );

        status.innerHTML =
        "❌ Location Permission Denied";
    }

);

}

/* ================= DISTRICT ================= */

function extractDistrict(address){

let districtBox =
document.getElementById("district");

if(!districtBox) return;

let parts = address.split(",");

if(parts.length >= 3){

    districtBox.value =
    parts[parts.length - 3].trim();
}

}

/* ================= ADDRESS ================= */

function getAddressFromCoords(lat,lng){

return fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
)
.then(res => res.json())
.then(data => data.display_name || "Unknown Location")
.catch(() => "Unknown Location");

}

/* ================= IMAGE PREVIEW ================= */

function previewImage(event){

let image =
document.getElementById("preview");

if(!image) return;

image.src =
URL.createObjectURL(event.target.files[0]);

image.style.display = "block";

}

/* ================= REMOVE IMAGE ================= */

function removeImage(){

let image =
document.getElementById("preview");

let file =
document.getElementById("photoInput");

if(image){

    image.src = "";
    image.style.display = "none";
}

if(file){

    file.value = "";
}

}

/* ================= SAVE COMPLAINT ================= */

function saveComplaint() {

let name = document.getElementById("name").value.trim();
let phone = document.getElementById("phone").value.trim();
let email = document.getElementById("email")?.value.trim() || "";
let location = document.getElementById("location").value.trim();
let authority = document.getElementById("authority").value;
let description = document.getElementById("description").value.trim();
let district = document.getElementById("district")?.value || "";
let ward = document.getElementById("ward")?.value || "";

if(name === "" || phone === "" || location === ""){

    alert("Please Fill All Required Fields");
    return;
}

if(phone.length !== 10){

    alert("Enter Valid 10 Digit Mobile Number");
    return;
}

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let count =
parseInt(localStorage.getItem("complaintCount")) || 0;

count++;

localStorage.setItem(
"complaintCount",
count
);

let complaint = {

    id: "ECO-" + String(count).padStart(4,"0"),

    name: name,
    phone: phone,
    email: email,

    district: district,
    ward: ward,

    location: location,
    authority: authority,
    description: description,

    status: "Pending",

    date: new Date().toLocaleString()

};

complaints.push(complaint);

localStorage.setItem(
"complaints",
JSON.stringify(complaints)
);

/* EMAIL SEND */

if(email){

emailjs.send(
"service_pcz9c9i",
"template_3pap0gt",
{
    complaint_id: complaint.id,
    name: complaint.name,
    location: complaint.location,
    district: complaint.district,
    ward: complaint.ward,
    authority: complaint.authority,
    status: complaint.status,
    email: complaint.email
}
)
.then(function(){

    console.log("Email Sent");

})
.catch(function(error){

    console.log("Email Error", error);

});

}

alert(
"✅ Complaint Submitted Successfully\nComplaint ID: " +
complaint.id
);

document.querySelector("form").reset();

removeImage();

if(document.getElementById("status")){

document.getElementById("status").innerHTML = "";

}

}

/* ================= SHOW TABLE ================= */

function showComplaintsTable(){

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let container =
document.getElementById("complaintList");

if(!container) return;

if(complaints.length === 0){

    container.innerHTML =
    "<h3 style='color:red;text-align:center;'>No Reports Found</h3>";

    return;
}

let output = `

<table class="report-table">

<tr>
    <th>ID</th>
    <th>Name</th>
    <th>Phone</th>
    <th>Email</th>
    <th>District</th>
    <th>Ward</th>
    <th>Location</th>
    <th>Authority</th>
    <th>Description</th>
    <th>Status</th>
    <th>Date</th>
    <th>Action</th>
</tr>
`;

complaints.forEach((c,index)=>{

    output += `

    <tr>

    <td>${c.id}</td>
    <td>${c.name}</td>
    <td>${c.phone}</td>
    <td>${c.email || "-"}</td>
    <td>${c.district || "-"}</td>
    <td>${c.ward || "-"}</td>
    <td>${c.location || "-"}</td>
    <td>${c.authority}</td>
    <td>${c.description || "-"}</td>
    <td>${c.status}</td>
    <td>${c.date}</td>

    <td>

        <button onclick="markResolved(${index})">
        ✅
        </button>

        <button onclick="deleteComplaint(${index})">
        🗑
        </button>

    </td>

</tr>
    `;
});

output += "</table>";

container.innerHTML = output;

}

/* ================= FILTER ================= */

function filterComplaints(type){

    let complaints =
    JSON.parse(localStorage.getItem("complaints")) || [];

    let filtered =
    complaints.filter(c => c.authority === type);

    let container =
    document.getElementById("complaintList");

    if(filtered.length === 0){

        container.innerHTML =
        "<h3 style='text-align:center;color:red;'>No Reports Found</h3>";

        return;
    }

    let output = `

    <table class="report-table">

    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Phone</th>
        <th>District</th>
        <th>Ward</th>
        <th>Location</th>
        <th>Authority</th>
        <th>Description</th>
        <th>Status</th>
        <th>Date</th>
    </tr>
    `;

    filtered.forEach(c => {

        output += `

        <tr>

            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.district || "-"}</td>
            <td>${c.ward || "-"}</td>
            <td>${c.location || "-"}</td>
            <td>${c.authority}</td>
            <td>${c.description || "-"}</td>
            <td>${c.status}</td>
            <td>${c.date}</td>

        </tr>
        `;
    });

    output += "</table>";

    container.innerHTML = output;
}
/* ================= RESOLVE ================= */

function markResolved(index){

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let complaint = complaints[index];

complaint.status = "Resolved";

localStorage.setItem(
"complaints",
JSON.stringify(complaints)
);

/* RESOLVED EMAIL */

if(complaint.email){

emailjs.send(
"service_pcz9c9i",
"template_resolved",
{
    complaint_id: complaint.id,
    name: complaint.name,
    authority: complaint.authority,
    status: "Resolved",
    email: complaint.email
}
);

}

showComplaintsTable();
loadStatistics();

alert("✅ Complaint Marked As Resolved");

}

/* ================= DELETE ================= */

function deleteComplaint(index){

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

if(confirm("Delete This Report?")){

    complaints.splice(index,1);

    localStorage.setItem(
    "complaints",
    JSON.stringify(complaints)
    );

    showComplaintsTable();
    loadStatistics();
}

}

/* ================= DELETE ALL ================= */

function deleteAllComplaints(){

if(confirm("Delete All Reports?")){

    localStorage.removeItem("complaints");
    localStorage.removeItem("complaintCount");

    showComplaintsTable();
    loadStatistics();

    alert("✅ All Reports Deleted");
}

}

/* ================= STATISTICS ================= */

function loadStatistics(){

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let total = complaints.length;

let pending =
complaints.filter(
c => c.status === "Pending"
).length;

let resolved =
complaints.filter(
c => c.status === "Resolved"
).length;

if(document.getElementById("totalComplaints"))
document.getElementById("totalComplaints").innerText = total;

if(document.getElementById("pendingComplaints"))
document.getElementById("pendingComplaints").innerText = pending;

if(document.getElementById("resolvedComplaints"))
document.getElementById("resolvedComplaints").innerText = resolved;

}

/* ================= SEARCH ================= */

function searchComplaint()
{

let input =
document.getElementById("searchInput");

if(!input) return;

let keyword =
input.value.toLowerCase();

let rows =
document.querySelectorAll(".report-table tr");

rows.forEach((row,index)=>{

    if(index === 0) return;

    let text =
    row.innerText.toLowerCase();

    row.style.display =
    text.includes(keyword)
    ? ""
    : "none";
});

}

/* ================= CSV DOWNLOAD ================= */

function downloadCSV(){

let complaints =
JSON.parse(localStorage.getItem("complaints")) || [];

let csv =
"ID,Name,Phone,Email,District,Ward,Location,Authority,Description,Status,Date\n";

complaints.forEach(c => {

    csv +=
    `"${c.id}","${c.name}","${c.phone}","${c.email || ""}","${c.district || ""}","${c.ward || ""}","${c.location || ""}","${c.authority}","${c.description || ""}","${c.status}","${c.date}"\n`;
});

let blob =
new Blob([csv],{type:"text/csv"});

let link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"ECOPlusReports.csv";

link.click();

}

/* ================= BACK ================= */

function goBack(){

if(window.history.length > 1){

    window.history.back();

}else{

    window.location.href = "index.html";
}}