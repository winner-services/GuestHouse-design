import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function ClotureChambre({ hideForm, singleRoom }) {
    let userdata = JSON.parse(localStorage.getItem('user'))
    let permissions = userdata.permissions
    const [transasctionData, setTransactionData] = useState([])
    const [detteData, setDetteData] = useState([])
    const [affectationData, setAffectationData] = useState({})
    const [reduction, setReduction] = useState(0)
    const { setLoader } = useContext(MainContext);
    const [accountData, setAccountData] = useState([]);
    const [is_additional_information_active, set_is_additional_information_active] = useState(false)
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
        destination_room_id: "",
        comment: "",
        account_id:"",
        _total_amount: "",
        _comment: "",
        _nombre_nuite: 0,
        _unite_price: 0,
        _paid_amount: 0,
        _reduction: 0
    })

    const change_info_fn = () => {
        setForm({
            ...form,
            _nombre_nuite: getDaysBetweenDates(affectationData.start_date, affectationData.end_date),
            _unite_price: singleRoom.unite_price,
            _paid_amount: Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0),
            _comment: form.comment
        })
        set_is_additional_information_active(true)
    }

    const submitData = async () => {

        let url = `createCloseStay`
        let method = 'POST'
        let single_form = {
            "total_amount": (getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)),
            "affectation_id": affectationData.id,
            "room_id": singleRoom.id,
            "reduction": reduction,
            "comment": form.comment,
            "account_id": form.account_id,
            "is_duplicted_data_exist": is_additional_information_active,
            "_total_amount": form._total_amount,
            "_comment": form._comment,
            "_nombre_nuite": form._nombre_nuite,
            "_unite_price": form._unite_price,
            "_paid_amount": form._paid_amount,
            "_reduction": form._reduction,
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

    function getCurrentDateTime() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function getDaysBetweenDates(startDateString, endDateString) {
        // Convert strings to Date objects
        const startDate = new Date(startDateString);
        const endDate = new Date(getCurrentDateTime());

        // Calculate the difference in  milliseconds
        const timeDiff = endDate - startDate;

        // Convert milliseconds to days
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return daysDiff == 0 ? 1 : daysDiff;
    }

    function formatDate(date, includeTime = false) {
        const dateObj = new Date(date); // Convert to Date object if it's not already

        if (isNaN(dateObj)) {
            return "Invalid Date"; // Handle invalid date inputs
        }

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        let formattedDate = `${day}/${month}/${year}`;

        if (includeTime) {
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
            formattedDate += ` ${hours}:${minutes}:${seconds}`;
        }

        return formattedDate;
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
                        +243997163443<br>
                        johnservicesmotel@gmail.com<br>
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

                        ${is_additional_information_active ? `
                            <tbody>
                            ${detteData.map((item, index) => (
                                `<tr>
                                    <td>${index + 1}</td>
                                    <td>${item.motif}</td>
                                    <td>1</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                </tr>`
                            ))}
                            <tr>
                                <td>${detteData.length + 1}</td>
                                <td>${singleRoom.designation} - ${singleRoom.categorie}</td>
                                <td>${form._nombre_nuite} Jours</td>
                                <td>${form._unite_price} $</td>
                                <td>${(form._nombre_nuite) * (form._unite_price)} $</td>
                            </tr>

                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">DEJA PAYE:</td>
                                <td class="total">${form._paid_amount} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">REDUCTION:</td>
                                <td class="total">${form._reduction} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">SOLDE:</td>
                                <td class="total">${(((form._nombre_nuite) * (form._unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (form._paid_amount) - (form._reduction))} $</td>
                            </tr>
                        </tfoot>
                        `: `
                            <tbody>
                            ${detteData.map((item, index) => (
                                `<tr>
                                    <td>${index + 1}</td>
                                    <td>${item.motif}</td>
                                    <td>1</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                    <td>${item.loan_amount - item.paid_amount} $</td>
                                </tr>`
                            ))}
                            <tr>
                                <td>${detteData.length + 1}</td>
                                <td>${singleRoom.designation} - ${singleRoom.categorie}</td>
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
                                <td class="total">MONTANT PAYE:</td>
                                <td class="total">${((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0))) - reduction} $</td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td class="total">TOTAL:</td>
                                <td class="total">${((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0))) - reduction} $</td>
                            </tr>
                        </tfoot>`}
                        
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

    useEffect(() => {
        getDetteClientOptions()
        getTransactionOptions()
        getAffectationOptions()
        getAccountOptions()
    }, [])

    return <>
        <div className="row">
            <h4>Cloturer le sejour du client</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                {is_additional_information_active ?
                    <ul className="list-group list-group-flush">
                        {detteData.map((item, index) => <>
                            <li className="list-group-item" key={index}>{item.motif} : {item.loan_amount - item.paid_amount} $</li>
                        </>)}
                        <li className="list-group-item">Nombre des nuités: <input value={form._nombre_nuite} onChange={(e) => setForm({ ...form, _nombre_nuite: e.target.value })} type="number" style={{ border: 0, width: 70 }} /> jours</li>
                        <li className="list-group-item">Prix Unitaire de la chambre: <input value={form._unite_price} onChange={(e) => setForm({ ...form, _unite_price: e.target.value })} type="number" style={{ border: 0, width: 70 }} /> $</li>
                        <li className="list-group-item">Prix Total de location chambre: {(form._nombre_nuite) * (form._unite_price)} $</li>
                        <li className="list-group-item">Montant payé: <input value={form._paid_amount} onChange={(e) => setForm({ ...form, _paid_amount: e.target.value })} type="number" style={{ border: 0, width: 70 }} /> $</li>
                        <li className="list-group-item">Redution: <input value={form._reduction} onChange={(e) => setForm({ ...form, _reduction: e.target.value })} type="number" style={{ border: 0, width: 70 }} /> $</li>
                        <li className="list-group-item"><strong>RESTE A PAYER : {((form._nombre_nuite * (form._unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (form._paid_amount)) - (form._reduction)} $</strong></li>
                        <li className="list-group-item">Commentaire:
                            <textarea className="form-control py-11" id="fname" value={form._comment} onChange={(e) => { setForm({ ...form, _comment: e.target.value }) }}
                                placeholder="Entrer un commentaire"></textarea>
                        </li>
                        <li className="list-group-item"><i><a href="#" onClick={() => set_is_additional_information_active(false)}>Retourner aux informations reelles</a></i></li>
                    </ul> :
                    <ul className="list-group list-group-flush">
                        {detteData.map((item, index) => <>
                            <li className="list-group-item" key={index}>{item.motif} : {item.loan_amount - item.paid_amount} $</li>
                        </>)}
                        <li className="list-group-item">Nombre des nuités: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date)} jours</li>
                        <li className="list-group-item">Prix Unitaire de la chambre: {singleRoom.unite_price} $</li>
                        <li className="list-group-item">Prix Total de location chambre: {getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)} $</li>
                        <li className="list-group-item">Montant payé: {Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0)} $</li>
                        <li className="list-group-item">Redution: <input value={reduction} onChange={(e) => setReduction(e.target.value)} type="number" style={{ border: 0, width: 70 }} /></li>
                        <li className="list-group-item"><strong>RESTE A PAYER : {((getDaysBetweenDates(affectationData.start_date, affectationData.end_date) * (singleRoom.unite_price)) + (Object.values(detteData).reduce((acc, item) => acc + (item.loan_amount), 0)) - (Object.values(transasctionData).reduce((acc, item) => acc + (item.amount), 0))) - reduction} $</strong></li>
                        <li className="list-group-item">Compte : 
                            <select id="" value={form.account_id} onChange={(e) => { setForm({ ...form, account_id: e.target.value }) }} style={{ border: 0, width: 150 }}>
                                <option hidden>Selectionnez un compte</option>
                                {accountData.map((item, index) => (
                                    <option value={item.id} key={index}>{item.designation}</option>
                                ))}
                            </select>
                        </li>
                        <li className="list-group-item">Commentaire:
                            <textarea className="form-control py-11" id="fname" value={form.comment} onChange={(e) => { setForm({ ...form, comment: e.target.value }) }}
                                placeholder="Entrer un commentaire"></textarea>
                        </li>
                        {permissions.includes("Gérer Autre Facture avec Autres Montants") ?(
                            <li className="list-group-item"><i><a href="#" onClick={() => change_info_fn()}>Voulez-vous une facture avec d'autres informations ?</a></i></li>
                        ):null}
                        
                    </ul>}

            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>

        </div>

    </>
}

export default ClotureChambre