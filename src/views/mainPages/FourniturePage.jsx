import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import Modal from 'react-bootstrap/Modal';
import { Dropdown } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function FourniturePage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [form, setForm] = useState({
        designation: "",
        quantity: 0,
        value: 0
    })

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(form).forEach(function (key, index) {
            delete form[key];
        });
    }

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getFournitureData?page=${page}&q=${q}`, {
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

    const modelUpdate = (model) => {
        setForm({
            ...form,
            designation: model.designation,
            quantity: model.quantity,
            value: model.value,
            id: model.id
        })
        seteFormVisible(true)
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

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createFourniture`
        let method = 'POST'
        if (form.id) {
            url = `updateFourniture/${form.id}`
            method = 'PUT'
            // insertUpdateFn(url, method, form)
        }

        setLoader(true)
        try {

            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(form),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une fourniture a ete insere avec success", "Success");
                hideForm(false)
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

    const changeDevise = (model) => {
        setDeviseValue(model)
    }

    const get_net_value = (value) => {
        let result = Number(value) * Number(deviseValue?.conversion_amount)
        return `${result} ${deviseValue?.symbol}`
    }

    const downloadReport = async () => {
            try {
                setLoader(true)
                const response = await fetch(`${BaseUrl}/getFournitureReport`, {
                    method: 'GET',
                    headers: headerRequest
                });
                const res = await response.json();
                console.log("DATAs:", res.data)
                if (res.data) {
    
                    const printData = res.data;
                    var logo = new Image()
                    logo.src = '/assets/images/logo.png'
                    const pdf = new jsPDF();
                    pdf.setProperties({
                        title: "Liste des fournitures"
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
                    pdf.text('LISTE DES FOURNITURES', 73, 60);
    
                    pdf.setFontSize(10);
                    pdf.setFont('custom', 'bold');
    
                    // Line width in units (you can adjust this)
                    pdf.setLineWidth(0.1);
    
                    // Generate AutoTable for item details
                    const itemDetailsRows = printData?.map((item, index) => [
                        (index + 1).toString(),
                        item.designation.toString(),
                        item.quantity?.toString(),
                        get_net_value(item.value)?.toString()
                    ]);
                    const itemDetailsHeaders = ['No', 'Designation', 'Quantite', 'Valeur'];
                    const columnWidths = [15, 65, 50, 50];
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
                    pdf.save(`Liste des fournitures.pdf`);
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

    return <>
        <div className="dashboard-body">

            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a>
                        </li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Fournitures</span></li>
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
                        <button className="btn btn-success me-1" onClick={() => downloadReport()}>Telecharger</button>
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
                                <th className="h6 text-gray-300">Designation</th>
                                <th className="h6 text-gray-300">Quantite</th>
                                <th className="h6 text-gray-300">P.U</th>
                                <th className="h6 text-gray-300">P.T</th>
                                <th className="h6 text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.designation}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.value)}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.value * item.quantity)}</span></td>
                                            <td>
                                                <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
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
        <Modal show={formVisible} onHide={hideForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Nouvelle fourniture</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label htmlFor="address" className="form-label mb-8 h6">Designation <span className="text-danger">*</span></label>
                    <input type="text" className="form-control py-11" id="address" value={form.designation} onChange={(e) => { setForm({ ...form, designation: e.target.value }) }}
                        placeholder="Entrer une designation" />
                </div>
                <div className="col-sm-12 col-xs-12 mt-3">
                    <label htmlFor="qty" className="form-label mb-8 h6">Quantite</label>
                    <input type="number" className="form-control py-11" id="qty" value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }) }}
                        placeholder="Entrer une quantite" />
                </div>
                <div className="col-sm-12 col-xs-12 mt-3">
                    <label htmlFor="value" className="form-label mb-8 h6">Valeur <span className="text-danger">*</span></label>
                    <input type="number" className="form-control py-11" id="value" value={form.value} onChange={(e) => { setForm({ ...form, value: e.target.value }) }}
                        placeholder="Entrer une valeur" />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </Modal.Footer>
        </Modal>
    </>

}

export default FourniturePage