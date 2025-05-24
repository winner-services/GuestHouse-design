import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import SortieStockForm from "./components/SortieStockForm"
import SortieStockViewmore from "./components/SortieStockViewmore"
import Modal from 'react-bootstrap/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function SortiStock() {
    const [formVisible, seteFormVisible] = useState(false)
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [modalVisible, setModalVisible] = useState(false);
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
            const response = await fetch(`${BaseUrl}/getOutletStoreData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data.data);
                setEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
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
            const response = await fetch(`${BaseUrl}/getSortieMagsinReport`, {
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
                    title: "Liste des transferts des produits"
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
                pdf.text(`LISTE DES TRANSFERTS DES PRODUITS DU ${formatDate(form.date_start)} AU ${formatDate(form.date_end)}`, 20, 60);

                pdf.setFontSize(10);
                pdf.setFont('custom', 'bold');

                // Line width in units (you can adjust this)
                pdf.setLineWidth(0.1);

                // Generate AutoTable for item details
                const itemDetailsRows = printData?.map((item, index) => [
                    (index + 1).toString(),
                    formatDate(item.transaction_date).toString(),
                    item.service?.toString(),
                    item.agent?.toString()
                ]);
                const itemDetailsHeaders = ['No', 'Date de transaction', 'Departement', 'Agent'];
                const columnWidths = [15, 55, 50, 50];
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
                pdf.save(`transferts des produits.pdf`);
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
                            <li><span className="text-main-600 fw-normal text-15">Liste des transferts des produits</span></li>
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
                                    <th className="h6 text-gray-300">Date de transaction</th>
                                    <th className="h6 text-gray-300">Departement</th>
                                    <th className="h6 text-gray-300">Agent</th>
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
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.service}</span></td>
                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                <td>
                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelViewmore(item)}><i className="ph ph-eye text-white"></i></button>
                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (<tr>
                                        <td colSpan={5}>
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
                    <Modal.Title>Rapport des Transferts des produits</Modal.Title>
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
        return <SortieStockForm hideForm={hideForm} singleClient={singleClient} />
    } else if (formVisible == false && viewmoreVisible == true) {
        return <SortieStockViewmore hideForm={hideForm} singleClient={singleClient} />
    }

}

export default SortiStock