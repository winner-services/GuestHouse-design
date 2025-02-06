import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import ApprovisionnementViewmore from "./components/ApprovisionnementViewmore"
import FournitureApprovisionementForm from "./components/FournitureApprovisionementForm"

function FournitureApprovisionementPage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [viewmoreVisible, setViewmoreVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])
    const { setLoader } = useContext(MainContext);
    const [deviseData, setDeviseData] = useState([]);
    const [deviseValue, setDeviseValue] = useState({});
    const [pendingData, setPendingData] = useState([])
    const [validatedData, setValidatedData] = useState([])
    const [rejectedData, setRejectedData] = useState([])
    const [pendingEntries, setPendingEntries] = useState([])
    const [validatedEntries, setValidatedEntries] = useState([])
    const [reejectedEntries, setRejectedEntries] = useState([])

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
                console.log("RES: ", res)
                res.data.data.filter(function(item) {
                    if (item.president_status === "Pending") {
                        setPendingData(res.data.data)
                        setPendingEntries(res.data)
                    }else if (item.president_status === "Validated") {
                        setValidatedData(res.data.data)
                        setValidatedEntries(res.data)
                    }else if (item.president_status === "Rejected") {
                        setRejectedData(res.data.data)
                        setRejectedEntries(res.data)
                    }
                })
                setDeviseData(res.devise)
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
            confirmButtonText: `Oui, ${model.status=='Validated'?'Valider':'Rejeter'}!`,
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
                    Swal.fire(`${model.status=='Validated'?'Validée':'Rejetée'}`, `Une chambre a été ${model.status=='Validated'?'Validée':'Rejetée'}`, 'success')
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
                            <div className="dropdown me-1">
                                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {deviseValue ? deviseValue.symbol : ''}
                                </button>
                                <ul className="dropdown-menu">
                                    {deviseData.map((item, index) => (
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
                    <div className="card-body p-0">

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
                                        aria-controls="pills-profile" aria-selected="false">Commandes validées</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-rejected-tab" data-bs-toggle="pill"
                                        data-bs-target="#pills-rejected" type="button" role="tab"
                                        aria-controls="pills-rejected" aria-selected="false">Commandes rejetées</button>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

                <div className="tab-content" id="pills-tabContent">
                    {/* My Details Tab start */}
                    <div className="tab-pane fade show active" id="pills-details" role="tabpanel"
                        aria-labelledby="pills-details-tab" tabindex="0">
                        <div className="card mt-24 overflow-hidden">
                            <div className="card-header border-bottom">
                                <h4 className="mb-4">Commandes en attente</h4>
                            </div>
                            <div className="card-body p-0 overflow-x-auto">
                                <table id="studentTable" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th className="fixed-width"> #</th>
                                            <th className="h6 text-gray-300">Date</th>
                                            <th className="h6 text-gray-300">Reference</th>
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
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_date}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                        <td>
                                                            <button className="btn btn-success p-9 me-1" onClick={() => modalValidateCommande({id:item.id, status:"Validated"})}><i className="ph ph-check text-white"></i></button>
                                                            <button className="btn btn-danger p-9" onClick={() => modalValidateCommande({id:item.id, status:"Rejected"})}><i className="ph ph-trash text-white"></i></button>
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
                            <div className="paginate mt-3">
                                <Pagination data={pendingEntries} limit={2} onPageChange={getResult} />
                            </div>
                        </div>
                    </div>

                    {/* Profile Tab Start */}
                    <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab"
                        tabindex="0">
                        <div className="card mt-24">
                            <div className="card-header border-bottom">
                                <h4 className="mb-4">Commandes validées </h4>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body p-0 overflow-x-auto">
                                        <table id="studentTable" className="table table-striped">
                                            <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Date</th>
                                                <th className="h6 text-gray-300">Reference</th>
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
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_date}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300"></span></td>
                                                                <td>
                                                                    <button className="btn btn-main p-9 me-1" onClick={() => modelViewmore(item)}><i className="ph ph-eye text-white"></i></button>
                                                                    <button className="btn btn-danger p-9" onClick={() => modelDette(item)}><i className="ph ph-trash text-white"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr>
                                                        <td colSpan={9}>
                                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                        </td>
                                                    </tr>)

                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="paginate mt-3">
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
                                <h4 className="mb-4">Commandes rejetées </h4>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body p-0 overflow-x-auto">
                                        <table id="studentTable" className="table table-striped">
                                        <thead>
                                        <tr>
                                            <th className="fixed-width"> #</th>
                                            <th className="h6 text-gray-300">Date</th>
                                            <th className="h6 text-gray-300">Reference</th>
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
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.transaction_date}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.reference}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.supplies}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price)}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity}</span></td>
                                                        <td><span className="h6 mb-0 fw-medium text-gray-300">{get_net_value(item.unit_price * item.quantity)}</span></td>
                                                        <td>
                                                            <button className="btn btn-main p-9 me-1" onClick={() => modelViewmore(item)}><i className="ph ph-eye text-white"></i></button>
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
                                    <div className="paginate mt-3">
                                        <Pagination data={reejectedEntries} limit={2} onPageChange={getResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Profile Tab End */}
                </div>

            </div>
        </>
    } else if (formVisible == true && viewmoreVisible == false) {
        return <FournitureApprovisionementForm hideForm={hideForm} />
    } else if (formVisible == false && viewmoreVisible == true) {
        return <ApprovisionnementViewmore hideForm={hideForm} singleClient={singleClient} />
    }

}

export default FournitureApprovisionementPage