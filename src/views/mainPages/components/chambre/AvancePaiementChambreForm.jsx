import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function AvancePaiementChambreForm({hideForm, singleRoom}) {
    const [affectationData, setAffectationData] = useState({})
    const { setLoader } = useContext(MainContext);
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        transaction_date:today,
        paid_amount:0,
        index:5
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

    const handleDownloadPDF = (reference, client) => {
        const logoImage = new Image();
        logoImage.src = "/assets/images/logo.png";
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
                        <span>Date: ${formatDate(today)} ${now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()}</span>
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
                            <th>Montant</th>
                            <th>Obs.</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td>${singleRoom.designation} - ${singleRoom.categorie}</td>
                            <td>${form.paid_amount} $</td>
                            <td></td>
                            </tr>
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colspan="2" class="total">TOTAL:</td>
                            <td class="total">${form.paid_amount} $</td>
                            <td></td>
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

    const submitData = async () => {

        let url = `advancePayment`
        let method = 'POST'

        setLoader(true)
        form.start_date = formatDate(form.start_date)
        form.end_date = formatDate(form.end_date)
        form.affectation_id = affectationData.id
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Un piement a ete effectue avec success", "Success");
                hideForm(false)
                // Object.keys(form).forEach(function (key, index) {
                //     delete form[key];
                // });
                handleDownloadPDF(res.reference, res.client)
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

    const getAffectationOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAffectationByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("AFFECTATION:", res.data)
            if (res.data) {
                setAffectationData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }


    useEffect(()=>{
        getAffectationOptions()
    },[])

    return <>
        <div className="row">
            <h4>Avance du paiement de la chambre</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Date de l'operation</label>
                <input type="date" className="form-control py-11" id="fname" value={form.transaction_date} onChange={(e) => { setForm({ ...form, transaction_date: e.target.value }) }}
                    placeholder="Entrer une date" />
            </div>
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="fname" className="form-label mb-8 h6">Montant payé</label>
                <input type="number" className="form-control py-11" id="fname" value={form.paid_amount} onChange={(e) => { setForm({ ...form, paid_amount: e.target.value }) }}
                    placeholder="Entrer un montant" />
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default AvancePaiementChambreForm