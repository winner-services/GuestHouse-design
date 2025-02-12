import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function ClotureChambre({hideForm, singleRoom}) {
    const [transasctionData, setTransactionData] = useState([])
    const [detteData, setDetteData] = useState([])
    const [affectationData, setAffectationData] = useState({})
    const [reduction, setReduction] = useState(0)
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
        origin_room_id: singleRoom.id,
        destination_room_id:""
    })

    const submitData = async () => {

        let url = `createCloseStay`
        let method = 'POST'
        let single_form = {
            "total_amount": (getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)),
            "affectation_id": affectationData.id,
            "room_id": singleRoom.id,
            "reduction": reduction
        }

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(single_form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une chambre a ete cloturee avec success", "Success");
                hideForm(false)
                Object.keys(form).forEach(function (key, index) {
                    delete form[key];
                });
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

    const getDetteClientOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDetteByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATA DETTE:", res.data)
            if (res.data) {
                setDetteData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getTransactionOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getTranstionByRoomId/${singleRoom.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setTransactionData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
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

    function getDaysBetweenDates(startDateString, endDateString) {
        // Convert strings to Date objects
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
      
        // Calculate the difference in  milliseconds
        const timeDiff = endDate - startDate;
      
        // Convert milliseconds to days
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
        return daysDiff;
    }

    const handleDownloadPDF = (reference, client) => {
        const logoImage = new Image();
        logoImage.src = "/assets/images/logo.png";
        logoImage.onload = () => {
            // Open the print window
            const WinPrint = window.open("", "Facture", "");

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
                            <th>Designation</th>
                            <th>Qté</th>
                            <th>P.U</th>
                            <th>P.T</th>
                        </tr>
                        </thead>
                        <tbody>
                            ${detteData.map((item, index) => (
                                `<tr>
                                    <td>${index + 1}</td>
                                    <td>${item.motif}</td>
                                    <td>1</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                </tr>`
                                ))
                            }
                            <tr>
                                <td>${detteData.length + 1}</td>
                                <td>Nombre des nuités</td>
                                <td>${getDaysBetweenDates(affectationData.start_date, affectationData.end_date)} Jours</td>
                                <td>${singleRoom.unite_price} $</td>
                                <td>${getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)} $</td>
                            </tr>

                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">DEJA PAYE:</td>
                                <td class="total">${Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">REDUCTION:</td>
                                <td class="total">${reduction} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">TOTAL:</td>
                                <td class="total">${((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0))) - reduction} $</td>
                            </tr>
                        </tfoot>
                    </table>
                    <center>
                        <i>Merci d'avoir sejourné chez nous. Revenez encore prochainement</i>
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

    useEffect(()=>{
        getDetteClientOptions()
        getTransactionOptions()
        getAffectationOptions()
    },[])

    return <>
        <div className="row">
            <h4>Cloturer le sejour du client</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                <ul className="list-group list-group-flush">
                    {detteData.map((item,index)=><>
                        <li className="list-group-item" key={index}>{item.motif} : {item.loan_amount - item.paid_amount} $</li>
                    </>)}
                    <li className="list-group-item">Nombre des nuités: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date)} jours</li>
                    <li className="list-group-item">Prix Unitaire: {singleRoom.unite_price} $</li>
                    <li className="list-group-item">Prix Total de location chambre: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)} $</li>
                    <li className="list-group-item">Montant payé: {Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)} $</li>
                    <li className="list-group-item">Redution: <input value={reduction} onChange={(e)=> setReduction(e.target.value)} type="number" style={{border:0, width:70}} /></li>
                    <li className="list-group-item"><strong>PRIX TOTAL : {((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0))) - reduction} $</strong></li>
                </ul>
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default ClotureChambre