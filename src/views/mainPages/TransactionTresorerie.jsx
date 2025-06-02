import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import TransactionTresorerieForm from "./components/TransactionTresorerieForm"
import { Dropdown } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function TransactionTresorerie() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [comptetData, setCompteData] = useState([])
    const [comptetName, setCompteName] = useState({})
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        date_start: today,
        date_end: today,
        account_id: ""
    })
    const hideModal = () => {
        setForm({ ...form, date_end: today, date_start: today })
        setModalVisible(false)
    }

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getCompteOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllAccounts`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setCompteData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getData = async (page = 1, q = '', compte = null) => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getTransactionData?page=${page}&q=${q}&account_id=${compte}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
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

    const downloadReport = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getTransactionTresorerieReport`, {
                method: 'POST',
                headers: headerRequest,
                body: JSON.stringify(form)
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {

                const printData = res.data;
                var logo = new Image()
                logo.src = '/assets/images/logo.png'
                const pdf = new jsPDF();
                pdf.setProperties({
                    title: "Liste des transactions financieres"
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
                pdf.text('+243999023794', 90, 47);
                pdf.text('johnservices@gmail.com', 83, 52);

                pdf.setFontSize(15);
                pdf.setFont('custom', 'bold');
                pdf.text(`LISTE DES TRANSACTIONS FINANCIERES DU ${formatDate(form.date_start)} AU ${formatDate(form.date_end)}`, 17, 60);

                pdf.setFontSize(10);
                pdf.setFont('custom', 'bold');

                // Line width in units (you can adjust this)
                pdf.setLineWidth(0.1);

                // Generate AutoTable for item details
                const itemDetailsRows = printData?.map((item, index) => [
                    (index + 1).toString(),
                    formatDate(item.transaction_date).toString(),
                    item.motif?.toString(),
                    item.account?.toString(),
                    item.transaction_type == 'RECETTE' ? get_net_value(item.amount) : ('-')?.toString(),
                    item.transaction_type == 'DEPENSE' ? get_net_value(item.amount) : ('-')?.toString(),
                    get_net_value(item.solde)?.toString(),
                ]);
                const itemDetailsHeaders = ['No', 'Date', 'Motif', 'Compte', 'Entrée', 'Sortie', 'Solde'];
                const columnWidths = [15, 25, 30, 30, 30, 30, 30];
                // Define table styles
                const headerStyles = {
                    fillColor: [240, 240, 240],
                    textColor: [0],
                    fontFamily: 'Newsreader',
                    fontStyle: 'bold',
                };
                pdf.setFont('Newsreader');
                const itemDetailsYStart = 65;
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
                pdf.save(`Liste des transactions financieres.pdf`);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1, term);
        } else {
            getData();
        }
    };

    const getResult = (pages) => {

        if (!pages) {
            pages = 1;
        }
        getData(pages);
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        let result = Number(value) * Number(deviseValue?.conversion_amount)
        return `${result} ${deviseValue?.symbol}`
    }

    const setCompteFn = (model) => {
        setCompteName(model)
        getData(1, '', model.id)
    }

    const handleDownloadPDF = (model) => {
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
                        +243997163443<br>
                        johnservicesmotel@gmail.com<br>
                        <span>Date: ${formatDate(model.transaction_date)}</span>
                        <h2>FACTURE No: ${model.reference}</h2>
                    </div>

                    <div class="client-info">
                        <strong>Beneficiaire:</strong><br>
                        .....................<br>
                    </div>

                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Motif</th>
                            <th>Montant</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>${model.motif}</td>
                                <td>${get_net_value(model.amount)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="1"></td>
                                <td class="total">TOTAL:</td>
                                <td class="total">${get_net_value(model.amount)}</td>
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

    useEffect(() => {
        getData()
        getCompteOptions()
    }, [])


    if (formVisible == false) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Transactions Financieres</span></li>
                        </ul>
                    </div>
                    {/* Breadcrumb End */}

                    {/* Breadcrumb Right Start */}
                    <div className="flex-align gap-8 flex-wrap">
                        <div className="position-relative text-gray-500 flex-align gap-4 text-13">
                            <input type="text" className="form-control" placeholder="Chercher..." onChange={(e) => { searchDataFn(e.target.value) }} />
                        </div>
                        <div
                            className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                            <Dropdown className="me-1">
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {comptetName.designation ? comptetName.designation : 'Caisse'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {comptetData.map((item, index) => (
                                        <Dropdown.Item key={index} onClick={() => setCompteFn(item)}>
                                            {item.designation}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
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
                            <button className="btn btn-success me-1" onClick={() => setModalVisible(true)}>Telecharger</button>
                            <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
                        </div>
                    </div>
                    {/* Breadcrumb Right End */}
                </div>


                <div className="card overflow-hidden">
                    <div className="card-body overflow-x-auto">
                        <table id="studentTable" className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th className="fixed-width"> #</th>
                                    <th className="h6 text-gray-300">Date</th>
                                    <th className="h6 text-gray-300">Motif</th>
                                    <th className="h6 text-gray-300">Compte</th>
                                    <th className="h6 text-gray-300">Entrée</th>
                                    <th className="h6 text-gray-300">Sortie</th>
                                    <th className="h6 text-gray-300">Solde</th>
                                    <th className="h6 text-gray-300">Actions</th>
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
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.account_name}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_type == 'RECETTE' ? get_net_value(item.amount) : '-'}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_type == 'DEPENSE' ? get_net_value(item.amount) : '-'}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.solde)}</span></td>
                                                <td>
                                                    <button className="btn btn-info p-9 me-1" onClick={() => handleDownloadPDF(item)}><i className="ph ph-printer text-white"></i></button>
                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={8}>
                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                        </td>
                                    </tr>)

                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="paginate mt-3 mb-8">
                        <Pagination data={entries} limit={2} onPageChange={getResult} />
                    </div>
                </div>

            </div>
            <Modal show={modalVisible} onHide={hideModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Rapport des Transactions financieres</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date debut</label>
                            <input type="date" className="form-control py-11" id="address" value={form.date_start} onChange={(e) => { setForm({ ...form, date_start: e.target.value }) }}
                            />
                        </div>
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date fin</label>
                            <input type="date" className="form-control py-11" id="address" value={form.date_end} onChange={(e) => { setForm({ ...form, date_end: e.target.value }) }}
                            />
                        </div>
                        <div className="col-sm-12 col-xs-12">
                            <label htmlFor="lname" className="form-label mb-8 h6 me-1">Compte de tresorerie <span className="text-danger">*</span></label>
                            <select className="form-control py-11" value={form.account_id} onChange={(e) => { setForm({ ...form, account_id: e.target.value }) }}>
                                <option hidden>Selectionner une option</option>
                                {comptetData.map((item, index) => (
                                    <option value={item.id} key={index}>{item.designation}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModal}>Annuler</button>
                    <button type="button" className="btn btn-main rounded-pill py-9" onClick={() => downloadReport()}>Telecharger</button>
                </Modal.Footer>
            </Modal>
        </>
    } else {
        return <TransactionTresorerieForm hideForm={hideForm} singleClient={singleClient} />
    }

}

export default TransactionTresorerie