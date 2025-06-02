import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import Modal from 'react-bootstrap/Modal';
import { Dropdown } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ClientViewmore({ hideForm, singleClient }) {
    const [data, setData] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [accountData, setAccountData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [formVisible, seteFormVisible] = useState(false)

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;

    const [form, setForm] = useState({
        transaction_date: today,
        paid_amount: 0,
        account_id:"",
        customer_id: singleClient.id
    })

    const hideModalForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(data).forEach(function (key, index) {
            delete data[key];
        });
    }

    const getData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getDebtsCutomer/${singleClient.id}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const downloadReport = async () => {
        try {
            const printData = data;
            var logo = new Image()
            logo.src = '/assets/images/logo.png'
            const pdf = new jsPDF();
            pdf.setProperties({
                title: "Liste des dettes du client"
            })

            // Add images and text to the PDF
            pdf.addImage(logo, 'png', 97, 3, 12, 20)
            pdf.setFontSize(16);
            pdf.setFont('custom', 'bold');
            pdf.text('JOHN SERVICES MOTEL', 70, 27);
            pdf.setFontSize(12);
            pdf.setFont('custom', 'normal');
            pdf.text('Q.les volcans, av.les messagers N° 13-B', 69, 32);
            pdf.text('RCCM: 22-A-01622', 86, 37);
            pdf.text('Impôt : A2315632S', 87, 42);
            pdf.text('+243997163443', 90, 47);
            pdf.text('johnservicesmotel@gmail.com', 83, 52);

            pdf.setFontSize(15);
            pdf.setFont('custom', 'bold');
            pdf.text('LISTE DES DETTES DU CLIENT', 65, 60);

            pdf.setFontSize(10);
            pdf.setFont('custom', 'normal');
            pdf.text(`Nom : ${singleClient.name}`, 13, 70);
            pdf.text(`Genre : ${singleClient.gender}`, 13, 75);
            pdf.text(`Addresse : ${singleClient.address}`, 13, 80);
            pdf.text(`Telephone : ${singleClient.phone}`, 13, 85);
            pdf.text(`Email : ${singleClient.email}`, 13, 90);
            pdf.text(`Pièce Identité : ${singleClient.identity_document}`, 13, 95);
            pdf.text(`Numéro pièce : ${singleClient.part_number}`, 13, 100);

            // Line width in units (you can adjust this)
            pdf.setLineWidth(0.1);

            // Generate AutoTable for item details
            const itemDetailsRows = printData?.map((item, index) => [
                (index + 1).toString(),
                formatDate(item.transaction_date).toString(),
                item.motif.toString(),
                get_net_value(item.loan_amount)?.toString(),
                get_net_value(item.paid_amount)?.toString(),
                get_net_value(item.loan_amount - item.paid_amount)?.toString(),
            ]);
            const itemDetailsHeaders = ['No', 'Date', 'Motif', 'Montant Total', 'Deja Payé', 'Montant Restant'];
            const columnWidths = [15, 30, 55, 30, 30, 30];
            // Define table styles
            const headerStyles = {
                fillColor: [240, 240, 240],
                textColor: [0],
                fontFamily: 'Newsreader',
                fontStyle: 'bold',
            };
            pdf.setFont('Newsreader');
            const itemDetailsYStart = 110;
            pdf.autoTable({
                head: [itemDetailsHeaders],
                body: itemDetailsRows,
                tableLineColor: 200,
                startY: itemDetailsYStart,
                headStyles: {
                    fillColor: headerStyles.fillColor,
                    textColor: headerStyles.textColor,
                    fontStyle: headerStyles.fontStyle,
                    fontSize: 10,
                    font: 'Newsreader',
                    halign: 'left',
                },
                columnStyles: {
                    0: { cellWidth: columnWidths[0] },
                    1: { cellWidth: columnWidths[1] },
                    2: { cellWidth: columnWidths[2] },
                    3: { cellWidth: columnWidths[3] },
                    4: { cellWidth: columnWidths[4] },
                    5: { cellWidth: columnWidths[5] },
                },
                alternateRowStyles: { fillColor: [255, 255, 255] },
                bodyStyles: {
                    fontSize: 10,
                    font: 'Newsreader',
                    cellPadding: { top: 1, right: 5, bottom: 1, left: 2 },
                    textColor: [0, 0, 0],
                    rowPageBreak: 'avoid',
                },
                margin: { top: 10, left: 13 },
            });

            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.line(10, 283, 200, 283)
                pdf.setPage(i);
                pdf.setFont('Newsreader');
                pdf.text(
                    `Page ${i} sur ${totalPages}`,
                    185,
                    pdf.internal.pageSize.getHeight() - 5
                );
            }

            // Save the PDF 
            pdf.save(`Liste des dettes du client.pdf`);
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        if (value) {
            let result = Number(value) * Number(deviseValue?.conversion_amount)
            return `${result} ${deviseValue?.symbol}`
        } else {
            return `0 $`
        }
    }

    const submitData = async (e) => {
        e.preventDefault()

        let url = `paymentDebtCustomer`
        let method = 'POST'

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une dette a ete payee avec success", "Success");
                hideModalForm(false)
                Object.keys(form).forEach(function (key, index) {
                    delete form[key];
                });
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
        getData()
        getAccountOptions()
    }, [])

    return <>
        <div className="dashboard-body">
            {/* Breadcrumb Start */}
            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Clients</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Details</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                        <Dropdown className="me-1">
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                {deviseValue ? deviseValue.symbol : ''}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {deviseData.map((item, index) => (
                                    <Dropdown.Item key={index} onClick={() => changeDevise(item)}>
                                        {item.symbol}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <button className="btn btn-secondary me-1" onClick={hideForm}>Retour</button>
                        <button className="btn btn-success me-1" onClick={() => downloadReport()}>Telecharger</button>
                        {data.length > 0 ? (
                            <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Paiement</button>
                        ) : null}

                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>
            {/* Breadcrumb End */}

            <div className="tab-content" id="pills-tabContent">
                {/* My Details Tab start */}
                <div className="tab-pane fade show active" id="pills-details" role="tabpanel"
                    aria-labelledby="pills-details-tab" tabIndex="0">
                    <div className="card mt-24">
                        <div className="card-header">
                            <span>Nom: {singleClient.name}</span><br />
                            <span>Genre: {singleClient.gender == "Masculin" ? 'Masculin' : 'Feminin'}</span><br />
                            <span>Addresse: {singleClient.address}</span><br />
                            <span>Telephone: {singleClient.phone}</span><br />
                            <span>Email: {singleClient.email}</span><br />
                            <span>Pièce Identité: {singleClient.identity_document}</span><br />
                            <span>Numéro pièce: {singleClient.part_number}</span><br />
                        </div>
                        <div className="card-body">
                            <h4 className="d-flex justify-content-center">LISTE DES DETTES DU CLIENT</h4>
                            <div className="card overflow-hidden">
                                <div className="card-body p-0 overflow-x-auto">
                                    <table id="studentTable" className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Date</th>
                                                <th className="h6 text-gray-300">Motif</th>
                                                <th className="h6 text-gray-300">Montant Total</th>
                                                <th className="h6 text-gray-300">Deja Payé</th>
                                                <th className="h6 text-gray-300">Montant Restant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data.length > 0 ? (
                                                    data.map((item, index) => (
                                                        <tr key={index}>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.motif}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.loan_amount)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.paid_amount)}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.loan_amount - item.paid_amount)}</span></td>
                                                        </tr>
                                                    ))
                                                ) : (<tr>
                                                    <td colSpan={6}>
                                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                    </td>
                                                </tr>)

                                            }
                                            <tr>
                                                <td colSpan={3}>
                                                    <strong className="d-flex justify-content-center">TOTAL</strong>
                                                </td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + (item["loan_amount"]), 0))}</strong></td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + (item["paid_amount"]), 0))}</strong></td>
                                                <td><strong>{get_net_value(Object.values(data).reduce((acc, item) => acc + ((item["loan_amount"]) - (item["paid_amount"])), 0))}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal show={formVisible} onHide={hideModalForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Paiement des dettes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label htmlFor="transaction_date" className="form-label h6">Date de transaction</label>
                    <input type="date" className="form-control py-11" id="transaction_date" value={form.transaction_date} onChange={(e) => { setForm({ ...form, transaction_date: e.target.value }) }}
                        placeholder="Entrer une date" />
                </div>
                <div className="col-sm-12 col-xs-12 mb-8">
                    <label htmlFor="amount" className="form-label mb-8 h6">Montant a payer</label>
                    <input type="number" className="form-control py-11" id="amount" value={form.paid_amount} onChange={(e) => { setForm({ ...form, paid_amount: e.target.value }) }}
                        placeholder="Entrer un montant" />
                </div>
                <div className="col-sm-12 col-xs-12 mb-8">
                    <label htmlFor="email" className="form-label mb-8 h6">Compte <span className="text-danger">*</span></label>
                    <select id="" value={form.account_id} onChange={(e) => { setForm({ ...form, account_id: e.target.value }) }} className="form-control py-11">
                        <option hidden>Selectionnez un compte</option>
                        {accountData.map((item, index) => (
                            <option value={item.id} key={index}>{item.designation}</option>
                        ))}
                    </select>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModalForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>
}

export default ClientViewmore