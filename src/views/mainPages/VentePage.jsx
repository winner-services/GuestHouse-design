import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import Modal from 'react-bootstrap/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [base_form, setBaseForm] = useState({
        paid_amount: 0,
        customer_id: "",
        total_price: 0,
        sale_date: today,
        account_id: 1,
        status: ""
    })

    const hideForm = () => {
        seteFormVisible(false)
        getData();
        Object.keys(singleVente).forEach(function (key, index) {
            delete singleVente[key];
        });
        Object.keys(pourchase_form).forEach(function (key, index) {
            delete pourchase_form[key];
        });
        Object.keys(base_form).forEach(function (key, index) {
            base_form[key] = ""
        });
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
            if (res.success) {
                toastr.success("Une vente a ete insere avec success", "Success");
                if (handleDownloadPDF(res.reference)) {
                    hideForm(false)
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
                setDeviseValue(Object.values(res.devise).filter(devise => devise.currency_type=='devise_principale')[0])
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
        let result = Number(value) * Number(deviseValue.conversion_amount)
        return `${result} ${deviseValue.symbol}`
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
            console.log("DATAs:", res.data)
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
                "total_price": 0
            }

            setpourchase_form((prevPourchaseForm) => [...prevPourchaseForm, { ...transit_form, index: pourchase_form.length }]);
            // setBaseForm((prevBaseForm) => ({
            //     ...prevBaseForm, 
            //     paid_amount: Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0) 
            // }));
            console.log("FORM:", pourchase_form)
            // Calculate total brut_total_price
            const sum = Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0);
            console.log("BRUTAL TOTAL PRICE: ", sum)
            base_form.paid_amount = sum;
        }
    };

    const removeLignBtn = (model) => {
        setpourchase_form((prevPourchaseForm) => {
            const updatedPourchaseForm = [...prevPourchaseForm]; // Create a copy of the array
            delete updatedPourchaseForm[model.index];
            return updatedPourchaseForm.filter(item => item !== undefined);
        });
        // setBaseForm((prevBaseForm) => ({
        //     ...prevBaseForm, 
        //     paid_amount: Object.values(pourchase_form).reduce((acc, item) => acc + item.total_price, 0) 
        // }));
    };

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
                        +243999023794<br>
                        johnsservices@gmail.com<br>
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

    useEffect(() => {
        getData()
        getClientOptions()
        getProductOptions()
        getProductCategoryOptions()
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
                            <div className="dropdown me-1">
                                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {deviseValue?deviseValue.symbol:''}
                                </button>
                                <ul className="dropdown-menu">
                                    {deviseData.map((item,index)=>(
                                        <li key={index}><a className="dropdown-item" type="button" href="#" onClick={() => changeDevise(item)}>{item.symbol}</a></li>
                                    ))}
                                </ul>
                            </div>
                        <button className="btn btn-primary" onClick={() => seteFormVisible(true)}>Ajouter</button>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>


            <div className="card overflow-hidden">
                <div className="card-body p-0 overflow-x-auto">
                    <table id="studentTable" className="table table-striped">
                        <thead>
                            <tr>
                                <th className="fixed-width"> #</th>
                                <th className="h6 text-gray-300">Date</th>
                                <th className="h6 text-gray-300">Clients</th>
                                <th className="h6 text-gray-300">Prix Total</th>
                                <th className="h6 text-gray-300">Montant payé</th>
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
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.sale_date}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.customer}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.total_price)}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.paid_amount)}</span></td>
                                            <td>
                                                {item.status == 0 ? <span class="plan-badge py-4 px-16 bg-main-600 text-white text-bold inset-inline-end-0 inset-block-start-0 mt-8 text-10">En attente</span> : ''}
                                                {item.status == 1 ? <span class="plan-badge py-4 px-16 bg-warning-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-10">Validées</span> : ''}
                                            </td>
                                            <td>
                                                <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                <button className="btn btn-success p-9 me-1" onClick={() => modelDette(item)}><i className="ph ph-eye text-white"></i></button>
                                                <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (<tr>
                                    <td colSpan={6}>
                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                    </td>
                                </tr>)

                            }
                        </tbody>
                    </table>
                </div>
                <div className="paginate mt-3">
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
                            <label htmlFor="fname" className="form-label mb-8 h6">Date de transaction</label>
                            <input type="date" className="form-control py-11" id="fname" value={base_form.sale_date} onChange={(e) => { setBaseForm({ ...base_form, sale_date: e.target.value }) }}
                                placeholder="Entrer une date" />
                        </div>
                        <div className="row">
                            <div className="col-sm-6 col-xs-6 mb-8">
                                <label htmlFor="email" className="form-label mb-8 h6">Client</label>
                                <select id="" value={base_form.customer_id} onChange={(e) => { setBaseForm({ ...base_form, customer_id: e.target.value }) }} className="form-control py-11">
                                    <option hidden>Selectionnez un client</option>
                                    {clientData.map((item, index) => (
                                        <option value={item.id} key={index}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-sm-6 col-xs-6 mb-8">
                                <label htmlFor="fname" className="form-label mb-8 h6">Montant Payé</label>
                                <input type="number" className="form-control py-11" id="fname" value={base_form.paid_amount} onChange={(e) => { setBaseForm({ ...base_form, paid_amount: e.target.value }) }}
                                    placeholder="Entrer un montant" />
                            </div>
                        </div>

                        <div className="col-sm-12 col-xs-12 mb-8">
                            <label htmlFor="email" className="form-label mb-8 h6">Produits</label>
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
                                            <th>Qté</th>
                                            <th>P.U</th>
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
                                                            updatedItems[index] = { ...updatedItems[index], quantity: newValue.target.value >= 1 ? newValue.target.value : 1, total_price: ((newValue.target.value) * (item.unite_price)) };
                                                            setpourchase_form(updatedItems);
                                                        }} style={{ borderWidth: 0, width: 40 }} /> {item.unite}</span></td>
                                                    <td><span className="h6 mb-0 fw-medium text-gray-300"><input type="number"
                                                        min={1}
                                                        value={item.unite_price}
                                                        onChange={(newValue) => {
                                                            const updatedItems = [...pourchase_form];
                                                            updatedItems[index] = { ...updatedItems[index], unite_price: newValue.target.value >= 1 ? newValue.target.value : 1, total_price: ((newValue.target.value) * (item.quantity)) };
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
    </>

}

export default VentePage