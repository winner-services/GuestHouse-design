import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import Modal from 'react-bootstrap/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dropdown } from 'react-bootstrap';
import VenteViewmore from "./components/VenteViewmore";

function VentePage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleVente, setSingleVente] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [clientData, setclientData] = useState([])
    const [productData, setproductData] = useState([])
    const [productCategoryData, setproductCategoryData] = useState([])
    const [pourchase_form, setpourchase_form] = useState([]);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [modalVisible, setModalVisible] = useState(false);
    const [accountData, setAccountData] = useState([]);
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [reportForm, setReportForm] = useState({
        date_start: today,
        date_end: today
    })
    const hideModal = () => {
        setReportForm({ ...reportForm, date_end: today, date_start: today })
        setModalVisible(false)
    }
    const [base_form, setBaseForm] = useState({
        paid_amount: 0,
        customer_id: "",
        total_price: 0,
        sale_date: today,
        account_id: "",
        comment: "",
        status: ""
    })

    const hideForm = () => {
        seteFormVisible(false)
        setViewmoreVisible(false)
        Object.keys(singleVente).forEach(function (key, index) {
            delete singleVente[key];
        });
        setpourchase_form([])
        setBaseForm({ ...base_form, paid_amount: 0, customer_id: "", total_price: 0, sale_date: today, account_id: 1, status: "" })
        setViewmoreVisible(false)
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
        getData();
        getProductOptions()
    }

    const submitData = async (status) => {
        let url = `createSaleByService`
        if (base_form.vente_id) {
            url = `createSaleByService?vente_id=${base_form.vente_id}`
        }
        let method = 'POST'
        let generalForm = {}

        generalForm.sale = base_form;
        generalForm.sale.status = status;
        generalForm.sale.total_price = Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0);
        generalForm.detail_sale = pourchase_form;

        setLoader(true)
        try {
            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(generalForm),
            });
            const res = await response.json();
            if (res.status) {
                handleDownloadPDF(res.reference)
                toastr.success("Une vente a ete insere avec success", "Success");
                hideForm(false)
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

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getSalesWithDetails?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
                setEntries(res);
                setDeviseData(res.devise)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
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

    const modelUpdate = (model) => {
        setBaseForm({
            ...base_form,
            paid_amount: model.paid_amount,
            total_price: model.total_price,
            sale_date: model.sale_date,
            customer_id: model.customer_id,
            vente_id: model.sale_id
        })
        setpourchase_form(model.details)
        seteFormVisible(true)
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        let result = Number(value) * Number(deviseValue?.conversion_amount)
        return `${result} ${deviseValue?.symbol}`
    }

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1, term);
        } else {
            getData();
        }
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

    const getProductOptions = async (cated_id = null) => {
        try {
            let url = 'getStockBySercive'
            if (cated_id) {
                url = `getStockByCategory/${cated_id}`
            }
            setLoader(true)
            const response = await fetch(`${BaseUrl}/${url}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs PRODUCT:", res.data)
            if (res.data) {
                Object.keys(productData).forEach(function (key, index) {
                    delete productData[key];
                });
                setproductData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getProductCategoryOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getProductCategoryOptions`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setproductCategoryData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const addLignBtn = (model_id) => {
        let model = Object.values(productData).find((product) => product.product_id == model_id);
        const existingProduct = Object.values(pourchase_form).find(item => item.product_id == model_id);

        if (existingProduct) {
            toastr.error('La marchandise existe déjà', 'Erreur!');
        } else {
            let transit_form = {
                "product_id": model.product_id,
                "product_name": model.product,
                "unite_price": model.unite_price,
                "unite": model.unite,
                "quantity": 1,
                "total_price": model.unite_price * 1
            }

            setpourchase_form((prevPourchaseForm) => [...prevPourchaseForm, { ...transit_form, index: pourchase_form.length }]);
            // setBaseForm({...base_form, paid_amount: Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0)})
            // console.log("FORM:", pourchase_form)
            // Calculate total brut_total_price
        }
    };

    const removeLignBtn = (model) => {
        setpourchase_form((prevPourchaseForm) => {
            const updatedPourchaseForm = [...prevPourchaseForm]; // Create a copy of the array
            delete updatedPourchaseForm[model.index];
            return updatedPourchaseForm.filter(item => item !== undefined);
        });
    };

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

    const getResult = (pages) => {
        if (!pages) {
            pages = 1;
        }
        getData(pages);
    }

    const handleDownloadPDF = (reference) => {
        let client = Object.values(clientData).find((client) => client.id == base_form.customer_id);
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
                            <th>Produit</th>
                            <th>Qté</th>
                            <th>P.U</th>
                            <th>P.T</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${pourchase_form.map((item, index) => (
                `<tr>
                                <td>${index + 1}</td>
                                <td>${item.product_name}</td>
                                <td>${item.quantity} ${item.unite}</td>
                                <td>${item.unite_price} $</td>
                                <td>${item.unite_price * item.quantity} $</td>
                            </tr>`
            ))
                }
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colspan="3"></td>
                            <td class="total">TOTAL:</td>
                            <td class="total">${Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0)} $</td>
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

    const modelViewmore = (model) => {
        setSingleClient(model)
        setViewmoreVisible(true)
    }

    const downloadReport = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getVenteRestaurantReport`, {
                method: 'POST',
                headers: headerRequest,
                body: JSON.stringify(reportForm)
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {

                const printData = res.data;
                var logo = new Image()
                logo.src = '/assets/images/logo.png'
                const pdf = new jsPDF();
                pdf.setProperties({
                    title: "Liste des ventes"
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
                pdf.text(`LISTE DES VENTES DU ${formatDate(reportForm.date_start)} AU ${formatDate(reportForm.date_end)}`, 45, 60);

                pdf.setFontSize(10);
                pdf.setFont('custom', 'bold');

                // Line width in units (you can adjust this)
                pdf.setLineWidth(0.1);

                // Generate AutoTable for item details
                const itemDetailsRows = printData?.map((item, index) => [
                    (index + 1).toString(),
                    formatDate(item.sale_date).toString(),
                    item.client?.toString(),
                    get_net_value(item.total_price)?.toString(),
                    get_net_value(item.paid_amount)?.toString(),
                    item.comment?.toString(),
                ]);
                const itemDetailsHeaders = ['No', 'Date', 'Clients', 'Prix Total', 'Montant payé', 'Observation'];
                const columnWidths = [15, 35, 30, 30, 35, 40];
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
                pdf.save(`Liste des ventes.pdf`);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        if (pourchase_form.length > 0) {
            setBaseForm((prevBaseForm) => ({
                ...prevBaseForm,
                paid_amount: Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0)
            }));
        } else {
            getData()
            getClientOptions()
            getProductOptions()
            getProductCategoryOptions()
            getAccountOptions()
        }
    }, [pourchase_form])

    if (viewmoreVisible == false) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Liste des ventes</span></li>
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
                                    <th className="h6 text-gray-300">Clients</th>
                                    <th className="h6 text-gray-300">Prix Total</th>
                                    <th className="h6 text-gray-300">Montant payé</th>
                                    <th className="h6 text-gray-300">Observation</th>
                                    <th className="h6 text-gray-300">Etat</th>
                                    <th className="h6 text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.sale_date)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.customer}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_price)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.paid_amount)}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.comment}</span></td>
                                                <td>
                                                    {item.status == 0 ? <span className="plan-badge py-4 px-16 bg-main-600 text-white text-bold inset-inline-end-0 inset-block-start-0 mt-8 text-10">En attente</span> : ''}
                                                    {item.status == 1 ? <span className="plan-badge py-4 px-16 bg-warning-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-10">Validées</span> : ''}
                                                </td>
                                                <td>{item.status == 0 ? (
                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                ) : null}
                                                    <button className="btn btn-success p-9 me-1" onClick={() => modelViewmore(item)}><i className="ph ph-eye text-white"></i></button>
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
            <Modal show={formVisible} onHide={hideForm} fullscreen={true} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Nouvelle Vente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="col-sm-12 col-xs-12 mb-8">
                                <label htmlFor="fname" className="form-label mb-8 h6">Date de transaction <span className="text-danger">*</span></label>
                                <input type="date" className="form-control py-11" id="fname" value={base_form.sale_date} onChange={(e) => { setBaseForm({ ...base_form, sale_date: e.target.value }) }}
                                    placeholder="Entrer une date" />
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-xs-6 mb-8">
                                    <label htmlFor="email" className="form-label mb-8 h6">Client <span className="text-danger">*</span></label>
                                    <select id="" value={base_form.customer_id} onChange={(e) => { setBaseForm({ ...base_form, customer_id: e.target.value }) }} className="form-control py-11">
                                        <option hidden>Selectionnez un client</option>
                                        {clientData.map((item, index) => (
                                            <option value={item.id} key={index}>{item.name} | {item.room}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-6 col-xs-6 mb-8">
                                    <label htmlFor="fname" className="form-label mb-8 h6">Montant Payé</label>
                                    <input type="number" className="form-control py-11" id="fname" value={base_form.paid_amount} onChange={(e) => { setBaseForm({ ...base_form, paid_amount: e.target.value }) }}
                                        placeholder="Entrer un montant" />
                                </div>
                                <div className="col-sm-12 col-xs-12 mb-8">
                                    <label htmlFor="email" className="form-label mb-8 h6">Compte <span className="text-danger">*</span></label>
                                    <select id="" value={base_form.account_id} onChange={(e) => { setBaseForm({ ...base_form, account_id: e.target.value }) }} className="form-control py-11">
                                        <option hidden>Selectionnez un compte</option>
                                        {accountData.map((item, index) => (
                                            <option value={item.id} key={index}>{item.designation}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-sm-12 col-xs-12 mb-8">
                                <label htmlFor="fname" className="form-label mb-8 h6">Commentaire</label>
                                <textarea className="form-control py-11" id="fname" value={base_form.comment} onChange={(e) => { setBaseForm({ ...base_form, comment: e.target.value }) }}
                                    placeholder="Entrer un commentaire"></textarea>
                            </div>

                            <div className="col-sm-12 col-xs-12 mb-8">
                                <label htmlFor="email" className="form-label mb-8 h6">Produits <span className="text-danger">*</span></label>
                                <select id="" className="form-control py-11" onChange={(e) => addLignBtn(e.target.value)}>
                                    <option hidden>Selectionnez un produit</option>
                                    {productData.map((item, index) => (
                                        <option value={item.product_id} key={index}>{item.product}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-sm-12 col-xs-12 mb-8">
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Produit</th>
                                                <th>Qté <span className="text-danger">*</span></th>
                                                <th>P.U <span className="text-danger">*</span></th>
                                                <th>P.T</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                pourchase_form.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product_name}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300"><input type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            onChange={(newValue) => {
                                                                const updatedItems = [...pourchase_form];
                                                                updatedItems[index] = { ...updatedItems[index], quantity: newValue.target.value >= 1 ? newValue.target.value : 1, total_price: ((newValue.target.value) * (item.unite_price >= 1 ? item.unite_price : 1)) };
                                                                setBaseForm({ ...base_form, paid_amount: updatedItems[index].unite_price * newValue.target.value })
                                                                setpourchase_form(updatedItems);
                                                            }} style={{ borderWidth: 0, width: 40 }} /> {item.unite}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300"><input type="number"
                                                            min={1}
                                                            value={item.unite_price}
                                                            onChange={(newValue) => {
                                                                const updatedItems = [...pourchase_form];
                                                                updatedItems[index] = { ...updatedItems[index], unite_price: newValue.target.value >= 1 ? newValue.target.value : 1, total_price: ((newValue.target.value) * (item.quantity >= 1 ? item.quantity : 1)) };
                                                                setBaseForm({ ...base_form, paid_amount: updatedItems[index].quantity * newValue.target.value })
                                                                setpourchase_form(updatedItems);
                                                            }} style={{ borderWidth: 0, width: 40 }} /></span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.total_price}</span></td>
                                                        <td>
                                                            <button type="button" className="btn btn-danger p-9" onClick={() => removeLignBtn(item)}>
                                                                <i className="ph ph-trash text-white"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            <tr>
                                                <td colSpan={4}>
                                                    <b className="d-flex justify-content-center">TOTAL</b>
                                                </td>
                                                <td><b>{Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0)}</b></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                        <div className="col-md-8">
                            <div style={{ overflowX: 'auto', display: 'flex', whiteSpace: 'nowrap', borderBottom: "1px solid #c2c8c6", paddingBottom: 15 }}>
                                {
                                    productCategoryData.map((item, index) => (
                                        // <div className="m-2" key={index} style={{ border: "1px solid #c2c8c6", borderRadius: 10, display: 'flex', justifyItems: 'center', background: '#c2c8c6', width: '10%', height: 80, cursor:'pointer' }} onClick={()=> getProductOptions(item.id)}>
                                        //     <p className="text-center" style={{ wordWrap: 'break-word' }}>{item.designation}</p>
                                        // </div>
                                        <div className="plan-item rounded-16 border border-gray-100 transition-2 position-relative me-1" key={index} onClick={() => getProductOptions(item.id)} style={{ cursor: 'pointer' }}>
                                            <h6 className="mb-4">{item.designation}</h6>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="row g-20" style={{ overflow: 'auto', height: 500 }}>
                                {productData.map((item, index) => (
                                    <div key={index} className="col-xl-3 col-md-4 col-sm-6 pt-12" style={{ cursor: 'pointer' }} onClick={() => addLignBtn(item.product_id)}>
                                        <div className="mentor-card rounded-8 overflow-hidden">
                                            <div className="mentor-card__cover position-relative" style={{ height: 100 }}>
                                                <img src={item.image ? `${ImageUrl}/${item.image}` : `/assets/images/default-product.png`} alt="" className="cover-img" style={{ height: '100%' }} />
                                            </div>
                                            <div className="mentor-card__content text-center" >
                                                <div style={{ paddingTop: 50 }}>
                                                    <h5 className="text-gray-500">{item.product}</h5>

                                                    <div className="mentor-card__rating mt-20 border border-gray-100 px-8 py-6 rounded-8 flex-between flex-wrap">
                                                        <div className="flex-align gap-4">
                                                            <span className="text-13 fw-normal text-gray-600">Prix :</span>
                                                        </div>
                                                        <div className="flex-align gap-4">
                                                            <span className="text-13 fw-normal text-gray-600">{get_net_value(item.unite_price)}</span>
                                                        </div>
                                                        <div className="vr"></div>
                                                        <div className="flex-align gap-4">
                                                            <span className="text-13 fw-normal text-gray-600">Qte :</span>
                                                        </div>
                                                        <div className="flex-align gap-4">
                                                            <span className="text-13 fw-normal text-gray-600">{item.stock_quantity} {item.unite}</span>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'flex-start' }}>
                    <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                    <button type="button" className="btn btn-main rounded-pill py-9" onClick={() => submitData(0)}>Enregistrer</button>
                    <button type="button" className="btn btn-success rounded-pill py-9" onClick={() => submitData(1)}>Cloturer</button>
                </Modal.Footer>
            </Modal>

            <Modal show={modalVisible} onHide={hideModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Rapport des Ventes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date debut</label>
                            <input type="date" className="form-control py-11" id="address" value={reportForm.date_start} onChange={(e) => { setReportForm({ ...reportForm, date_start: e.target.value }) }}
                            />
                        </div>
                        <div className="col-sm-6 col-xs-6">
                            <label htmlFor="address" className="form-label mb-8 h6">Date fin</label>
                            <input type="date" className="form-control py-11" id="address" value={reportForm.date_end} onChange={(e) => { setReportForm({ ...reportForm, date_end: e.target.value }) }}
                            />
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
        return <VenteViewmore hideForm={hideForm} singleClient={singleClient} />
    }


}

export default VentePage