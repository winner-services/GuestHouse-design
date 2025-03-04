import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function ReservationChambreForm({hideForm, singleRoom}) {
    const [clientData, setclientData] = useState([])
    const { setLoader } = useContext(MainContext);
    const [accountData, setAccountData] = useState([]); 
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        customer_id: "",
        room_id:singleRoom.id,
        paid_amount:0,
        start_date:today,
        end_date:today,
        account_id: "",
        index:1
    })

    function formatDate(isoString) {
        // Create a Date object from the ISO string
        const date = new Date(isoString);
      
        // Extract individual components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const  
       hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2,  
       '0');
      
        // Construct the desired format
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const submitData = async () => {

        let url = `createAssignment`
        let method = 'POST'

        setLoader(true)

        form.start_date = formatDate(form.start_date)
        form.end_date = formatDate(form.end_date)

        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une chambre a ete reserve avec success", "Success");
                hideForm(false)
                // Object.keys(form).forEach(function (key, index) {
                //     delete form[key];
                // });
                if (form.paid_amount > 0) {
                    handleDownloadPDF(res.reference)
                }
                setLoader(false)
            } else {
                toastr.error("Veillez reessayez", "Erreur");
                console.log(res)
                setLoader(false)
                // window.location.reload()
            }
        } catch (error) {
            toastr.error("Veillez reessayez", "Erreur");
            console.error(error);
            setLoader(false)
        }
    }

    function getDaysBetweenDates(startDateString, endDateString) {
        // Convert strings to Date objects
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        // Calculate the difference in  milliseconds
        const timeDiff = endDate - startDate;

        // Convert milliseconds to days
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return daysDiff==0?1:daysDiff;
    }

    const handleDownloadPDF = (reference) => {
        const logoImage = new Image();
        logoImage.src = "/assets/images/logo.png";
        const client = clientData.find((item) => item.id == form.customer_id)
        logoImage.onload = () => {
            // Open the print window
            const WinPrint = window.open("", "facture", "");

            WinPrint.document.write(`<!DOCTYPE html>
                    <head>
                    <style>
                        body {
                            font-family: sans-serif;
                            font-size: 10px;
                            display: flex; 
                            justify-content: center; 
                            align-items: center;
                            margin: 0; 
                        }

                        .invoice-container {
                        width: 70mm; /* Adjust width as needed */
                        margin: 10mm auto;
                        padding: 5mm;
                        }

                        .header {
                        text-align: center;
                        margin-bottom: 5mm;
                        }

                        .company-info {
                        margin-bottom: 5mm;
                        }

                        .client-info {
                        margin-bottom: 1mm;
                        }

                        table {
                        width: 100%;
                        border-collapse: collapse;
                        }

                        th, td {
                        border: 1px solid #ccc;
                        padding: 2mm;
                        text-align: left;
                        }

                        .total {
                        font-weight: bold;
                        }

                        @page {
                        size: auto;
                        margin: 0mm; 
                        }

                        html { 
                        -moz-print-margin-top: 0mm; 
                        -moz-print-margin-bottom: 0mm; 
                        }

                        .logo {
                            width: 90px; /* Adjust as needed */
                            margin-bottom: 2mm;
                        }
                    </style>
                    </head>
                    <body>

                    <div class="invoice-container">
                    <div class="header">
                        <img class="logo" src="/assets/images/logo.png" alt="Your Company Logo"><br>
                        <strong>JOHN SERVICES MOTEL</strong><br>
                        Q.les volcans, av.les messagers N° 13-B<br>
                        RCCM: 22-A-01622<br>
                        Impôt : A2315632S<br>
                        +243999023794<br>
                        johnservices@gmail.com<br>
                        <span>Date: ${formatDate(today)} ${now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()}</span>
                        <h2>FACTURE No: ${reference}</h2>
                    </div>

                    <div class="client-info">
                        <strong>Client:</strong><br>
                        ${client ? client.name : '-'}<br>
                        ${client ? client.phone : ''}
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Chambre</th>
                            <th>Qté</th>
                            <th>P.U</th>
                            <th>P.T</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>${singleRoom.designation} - ${singleRoom.categorie}</td>
                                <td>${getDaysBetweenDates(form.start_date, form.end_date)} Jours</td>
                                <td>${singleRoom.unite_price} $</td>
                                <td>${getDaysBetweenDates(form.start_date, form.end_date) * (singleRoom.unite_price)} $</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">DEJA PAYE:</td>
                                <td class="total">${Number(form.paid_amount)} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">REDUCTION:</td>
                                <td class="total">0 $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">RESTE A PAYER:</td>
                                <td class="total">${((getDaysBetweenDates(form.start_date, form.end_date) * (singleRoom.unite_price)) - (Number(form.paid_amount)))} $</td>
                            </tr>
                        </tfoot>
                    </table>
                    <center>
                        <i>Merci d'avoir acheté chez nous. Revenez encore prochainement</i>
                    </center>
                </div>
                </body>
            </html>`);

            WinPrint.document.close();
            WinPrint.focus();
            WinPrint.print();
            WinPrint.close();
        };
    };

    const getClientOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getCustomerOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setclientData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getAccountOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllAccounts`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setAccountData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(()=>{
        getClientOptions()
        getAccountOptions()
    },[])

    return <>
        <div className="row">
            <h4>Reservation de la chambre</h4>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date de l'operation</label>
                <input type="date" className="form-control py-11" id="fname" value={form.sale_date} onChange={(e) => { setForm({ ...form, sale_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Montant paye</label>
                <input type="number" className="form-control py-11" id="fname" value={form.paid_amount} onChange={(e) => { setForm({ ...form, paid_amount: e.target.value }) }}
                    placeholder="Entrer un montant" />
            </div>
            {form.paid_amount > 0 ? (
                <div className="col-sm-12 col-xs-12 mb-8">
                    <label htmlFor="email" className="form-label mb-8 h6">Compte <span className="text-danger">*</span></label>
                    <select id="" value={form.account_id} onChange={(e) => { setForm({ ...form, account_id: e.target.value }) }} className="form-control py-11">
                        <option hidden>Selectionnez un compte</option>
                        {accountData.map((item, index) => (
                            <option value={item.id} key={index}>{item.designation}</option>
                        ))}
                    </select>
                </div>
            ) : null}
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="email" className="form-label mb-8 h6">Client</label>
                <select id="" value={form.customer_id} onChange={(e) => { setForm({ ...form, customer_id: e.target.value }) }} className="form-control py-11">
                    <option hidden>Selectionnez un client</option>
                    {clientData.map((item, index) => (
                        <option value={item.id} key={index}>{item.name}</option>
                    ))}
                </select>
            </div>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date debut</label>
                <input type="date" className="form-control py-11" id="fname" value={form.start_date} onChange={(e) => { setForm({ ...form, start_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>
            <div className="col-sm-6 col-xs-6 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date de fin</label>
                <input type="date" className="form-control py-11" id="fname" value={form.end_date} onChange={(e) => { setForm({ ...form, end_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default ReservationChambreForm