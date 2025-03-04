import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import ApprovisionnementViewmore from "./components/ApprovisionnementViewmore"
import FournitureApprovisionementForm from "./components/FournitureApprovisionementForm"
import { Dropdown } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function FournitureApprovisionementPage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    let userdata = JSON.parse(localStorage.getItem('user'))
    let role = userdata.roles[0]
    let permissions = userdata.permissions
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [pendingData, setPendingData] = useState([])
    const [validatedData, setValidatedData] = useState([])
    const [rejectedData, setRejectedData] = useState([])
    const [pendingEntries, setPendingEntries] = useState([])
    const [validatedEntries, setValidatedEntries] = useState([])
    const [reejectedEntries, setRejectedEntries] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [reportIndex, setReportIndex] = useState(0);
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
        date_end: today
    })
    const showModal = (index) => {
        setReportIndex(index)
        setModalVisible(true)
    }

    const hideModal = () => {
        setForm({ ...form, date_end: today, date_start: today })
        setModalVisible(false)
    }

    const hideForm = () => {
        seteFormVisible(false)
        setViewmoreVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getAllCommandeFourniture?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            if (res.data) {
                console.log("RES: ", res.data)
                let pendingDatas = []
                let validatedDatas = []
                let rejectedDatas = []
                Object.values(res.data.data).forEach(function (item) {
                    if (item.president_status === "Pending") {
                        pendingDatas = pendingDatas.concat(item)
                        setPendingEntries(res.data)
                    } else if (item.president_status === "Validated") {
                        validatedDatas = validatedDatas.concat(item)
                        setValidatedEntries(res.data)
                    } else if (item.president_status === "Rejected") {
                        rejectedDatas = rejectedDatas.concat(item)
                        setRejectedEntries(res.data)
                    }
                })
                setPendingData(pendingDatas)
                setValidatedData(validatedDatas)
                setRejectedData(rejectedDatas)
                setDeviseData(rejectedDatas)
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type == 'devise_principale')[0])
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        let result = Number(value) * Number(deviseValue.conversion_amount)
        return `${result} ${deviseValue.symbol}`
    }

    const modelViewmore = (model) => {
        setSingleClient(model)
        setViewmoreVisible(true)
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

    const modalValidateCommande = (model) => {
        Swal.fire({
            title: "Etes-vous sûr?",
            text: "Une fois effectué, cette operation ne peut pas etre annulée.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Oui, ${model.status == 'Validated' ? 'Valider' : 'Rejeter'}!`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoader(true)
                const response = await fetch(`${BaseUrl}/validateCommandeFourniture/${model.id}`, {
                    method: 'PUT',
                    headers: headerRequest,
                    body: JSON.stringify(model)
                });
                const res = await response.json();
                if (res.success) {
                    getData()
                    Swal.fire(`${model.status == 'Validated' ? 'Validée' : 'Rejetée'}`, `Une commande a été ${model.status == 'Validated' ? 'Validée' : 'Rejetée'}`, 'success')
                }
                setLoader(false)
            } else {
                setLoader(false)
            }
        }).catch((error) => {
            console.error("ERROR:", error);
            Swal.fire("Erreur", 'Veiller reessayer', 'error')
            setLoader(false)
        })
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
            const response = await fetch(`${BaseUrl}/getApprovisionnementFournitureReport`, {
                method: 'POST',
                headers: headerRequest,
                body: JSON.stringify(form)
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                let pendingDatas = []
                let validatedDatas = []
                let rejectedDatas = []
                let printData = [];
                Object.values(res.data).forEach(function (item) {
                    if (item.president_status === "Pending") {
                        pendingDatas = pendingDatas.concat(item)
                    } else if (item.president_status === "Validated") {
                        validatedDatas = validatedDatas.concat(item)
                    } else if (item.president_status === "Rejected") {
                        rejectedDatas = rejectedDatas.concat(item)
                    }
                })
                if (reportIndex == 1) {
                    console.log("reportIndex:",reportIndex)
                    console.log("pendingDatas:",pendingDatas)
                    printData = pendingDatas
                } else if (reportIndex == 2){
                    printData = validatedDatas
                } else if (reportIndex == 3){
                    printData = rejectedDatas
                }


                
                var logo = new Image()
                logo.src = '/assets/images/logo.png'
                const pdf = new jsPDF();
                pdf.setProperties({
                    title: "Liste des approvisionnements des fournitures"
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
                pdf.text(`COMMANDES ${reportIndex==1?"EN ATTENTE":reportIndex==2?"VALIDEES":reportIndex==3?"REJETEES":""} DES FOURNITURES DU ${formatDate(form.date_start)} AU ${formatDate(form.date_end)}`, 12, 60);

                pdf.setFontSize(10);
                pdf.setFont('custom', 'bold');

                // Line width in units (you can adjust this)
                pdf.setLineWidth(0.1);

                // Generate AutoTable for item details
                const itemDetailsRows = printData?.map((item, index) => [
                    (index + 1).toString(),
                    formatDate(item.transaction_date).toString(),
                    item.reference?.toString(),
                    item.agent?.toString(),
                    item.supplier?.toString(),
                    item.supplies?.toString(),
                    get_net_value(item.unit_price)?.toString(),
                    item.quantity?.toString(),
                    get_net_value(item.unit_price * item.quantity)?.toString(),
                ]);
                const itemDetailsHeaders = ['No', 'Date', 'Reference', 'Agent', 'Fournisseur', 'Fourniture', 'P.U','Qte','P.T'];
                const columnWidths = [15, 25, 20, 25, 25, 30, 20, 20, 20];
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
                        6: { cellWidth: columnWidths[6] },
                        7: { cellWidth: columnWidths[7] },
                        8: { cellWidth: columnWidths[8] },
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
                pdf.save(`Liste des approvisionnements des fournitures.pdf`);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])


    if (formVisible == false && viewmoreVisible == false) {
        return <>
            <div className="dashboard-body">

                <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                    {/* Breadcrumb Start */}
                    <div className="breadcrumb mb-24">
                        <ul className="flex-align gap-4">
                            <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                            </li>
                            <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                            <li><span className="text-main-600 fw-normal text-15">Liste des approvisionements</span></li>
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
                            <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
                        </div>
                    </div>
                    {/* Breadcrumb Right End */}
                </div>

                <div className="card overflow-hidden">
                    <div className="card-body p-0">
                        {role == "TRESORIER" ? (
                            <div className="setting-profile" style={{ marginTop: 24 }}>
                                <ul className="nav common-tab style-two nav-pills mb-0" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
                                            data-bs-target="#pills-profile" type="button" role="tab"
                                            aria-controls="pills-profile" aria-selected="false">Commandes Validée</button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="setting-profile" style={{ marginTop: 24 }}>
                                <ul className="nav common-tab style-two nav-pills mb-0" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="pills-details-tab" data-bs-toggle="pill"
                                            data-bs-target="#pills-details" type="button" role="tab"
                                            aria-controls="pills-details" aria-selected="true">Commandes en attente</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
                                            data-bs-target="#pills-profile" type="button" role="tab"
                                            aria-controls="pills-profile" aria-selected="false">Commandes Validée</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="pills-rejected-tab" data-bs-toggle="pill"
                                            data-bs-target="#pills-rejected" type="button" role="tab"
                                            aria-controls="pills-rejected" aria-selected="false">Commandes rejetées</button>
                                    </li>
                                </ul>
                            </div>
                        )}

                    </div>
                </div>

                <div className="tab-content" id="pills-tabContent">
                    {/* My Details Tab start */}
                    <div className={`tab-pane fade ${role == "TRESORIER" ? "" : "show active"}`} id="pills-details" role="tabpanel"
                        aria-labelledby="pills-details-tab" tabindex="0">
                        <div className="card mt-24 overflow-hidden">

                            <div className="card-header border-bottom">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h4 className="mb-4">Commandes en attente</h4>
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-success me-1" style={{ float: 'right' }} onClick={() => showModal(1)}>Telecharger</button>
                                    </div>


                                </div>
                            </div>

                            <div className="card-body overflow-x-auto">
                                <table id="studentTable" className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th className="fixed-width"> #</th>
                                            <th className="h6 text-gray-300">Date</th>
                                            <th className="h6 text-gray-300">Reference</th>
                                            <th className="h6 text-gray-300">Agent</th>
                                            <th className="h6 text-gray-300">Fournisseur</th>
                                            <th className="h6 text-gray-300">Fourniture</th>
                                            <th className="h6 text-gray-300">Prix Unitaire</th>
                                            <th className="h6 text-gray-300">Quantite</th>
                                            <th className="h6 text-gray-300">Prix Total</th>
                                            <th className="h6 text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            pendingData.length > 0 ? (
                                                pendingData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplier}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                        {permissions.includes("Valider Commande DG")?(
                                                            <td>
                                                                <button className="btn btn-success p-9 me-1" onClick={() => modalValidateCommande({ id: item.id, status: "Validated" })}><i className="ph ph-check text-white"></i></button>
                                                                <button className="btn btn-danger p-9" onClick={() => modalValidateCommande({ id: item.id, status: "Rejected" })}><i className="ph ph-trash text-white"></i></button>
                                                            </td>
                                                        ):<td></td>}
                                                        
                                                    </tr>
                                                ))
                                            ) : (<tr>
                                                <td colSpan={10}>
                                                    <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                </td>
                                            </tr>)

                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="paginate mt-3 mb-8">
                                <Pagination data={pendingEntries} limit={2} onPageChange={getResult} />
                            </div>
                        </div>
                    </div>

                    {/* Profile Tab Start */}
                    <div className={`tab-pane fade ${role == "TRESORIER" ? "show active" : ""}`} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab"
                        tabindex="0">
                        <div className="card mt-24">

                            <div className="card-header border-bottom">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h4 className="mb-4">Commandes Validées</h4>
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-success me-1" style={{ float: 'right' }} onClick={() => showModal(2)}>Telecharger</button>
                                    </div>


                                </div>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width"> #</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Reference</th>
                                                    <th className="h6 text-gray-300">Agent</th>
                                                    <th className="h6 text-gray-300">Fournisseur</th>
                                                    <th className="h6 text-gray-300">Fourniture</th>
                                                    <th className="h6 text-gray-300">Prix Unitaire</th>
                                                    <th className="h6 text-gray-300">Quantite</th>
                                                    <th className="h6 text-gray-300">Prix Total</th>
                                                    <th className="h6 text-gray-300">Etat</th>
                                                    <th className="h6 text-gray-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    validatedData.length > 0 ? (
                                                        validatedData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplier}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                                <td>
                                                                    {item.treasure_status == 0 ? <span className="plan-badge py-4 px-16 bg-info-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-15">En attente</span> : ''}
                                                                    {item.treasure_status == 1 ? <span className="plan-badge py-4 px-16 bg-warning-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-15">Validée</span> : ''}
                                                                </td>
                                                                <td>
                                                                    {permissions.includes("Valider Commande COMPTABLE") ?(
                                                                        <button className="btn btn-main p-9 me-1" onClick={() => modalValidateCommande({ id: item.id, status: "Validated" })}><i className="ph ph-check text-white"></i></button>
                                                                    ):null}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr>
                                                        <td colSpan={11}>
                                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                        </td>
                                                    </tr>)

                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="paginate mt-3 mb-8">
                                        <Pagination data={validatedEntries} limit={2} onPageChange={getResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Profile Tab End */}

                    {/* Profile Tab Start */}
                    <div className="tab-pane fade" id="pills-rejected" role="tabpanel" aria-labelledby="pills-rejected-tab"
                        tabindex="0">
                        <div className="card mt-24">
                            <div className="card-header border-bottom">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h4 className="mb-4">Commandes rejetées</h4>
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-success me-1" style={{ float: 'right' }} onClick={() => showModal(3)}>Telecharger</button>
                                    </div>


                                </div>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width"> #</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Reference</th>
                                                    <th className="h6 text-gray-300">Agent</th>
                                                    <th className="h6 text-gray-300">Fournisseur</th>
                                                    <th className="h6 text-gray-300">Fourniture</th>
                                                    <th className="h6 text-gray-300">Prix Unitaire</th>
                                                    <th className="h6 text-gray-300">Quantite</th>
                                                    <th className="h6 text-gray-300">Prix Total</th>
                                                    <th className="h6 text-gray-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    rejectedData.length > 0 ? (
                                                        rejectedData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplier}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                                <td>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr>
                                                        <td colSpan={10}>
                                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                        </td>
                                                    </tr>)

                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="paginate mt-3 mb-8">
                                        <Pagination data={reejectedEntries} limit={2} onPageChange={getResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Profile Tab End */}
                </div>

            </div>

            <Modal show={modalVisible} onHide={hideModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Rapport des Commandes</Modal.Title>
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
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideModal}>Annuler</button>
                    <button type="button" className="btn btn-main rounded-pill py-9" onClick={() => downloadReport()}>Telecharger</button>
                </Modal.Footer>
            </Modal>
        </>
    } else if (formVisible == true && viewmoreVisible == false) {
        return <FournitureApprovisionementForm hideForm={hideForm} />
    } else if (formVisible == false && viewmoreVisible == true) {
        return <ApprovisionnementViewmore hideForm={hideForm} singleClient={singleClient} />
    }

}

export default FournitureApprovisionementPage