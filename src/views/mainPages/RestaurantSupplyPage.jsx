import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../config/MainContext"
import Pagination from "../../pagination/Pagination"
import RestoSupplyForm from "./components/RestoSupplyForm"

function RestaurantSupplyPage() {
    const [formVisible, seteFormVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [pendingData, setPendingData] = useState([])
    const [allData, setAllData] = useState([])
    const [validatedData, setValidatedData] = useState([])
    const [rejectedData, setRejectedData] = useState([])
    const [allEntries, setAllEntries] = useState([])
    const [pendingEntries, setPendingEntries] = useState([])
    const [validatedEntries, setValidatedEntries] = useState([])
    const [reejectedEntries, setRejectedEntries] = useState([])
    const { setLoader } = useContext(MainContext);

    const hideForm = () => {
        seteFormVisible(false)
        getPendingData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const getPendingData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getPendingOrderData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setPendingData(res.data.data);
                setPendingEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getActivatedData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getValidateOrdersData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setValidatedData(res.data.data);
                setValidatedEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getRejectedData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRejectedOrdersData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setRejectedData(res.data.data);
                setRejectedEntries(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const getAllData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getOdersData?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setAllData(res.data.data);
                setAllEntries(res.data);
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
            getAllData(1, term);
            getPendingData(1, term);
            getActivatedData(1, term);
            getRejectedData(1, term);
        } else {
            getAllData();
            getPendingData();
            getActivatedData();
            getRejectedData();
        }
    };

    const getResult = (pages) => {

        if (!pages) {
            pages = 1;
        }
        getAllData(pages)
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

    const updateData = async (status = "", model) => {

        let url = ''
        let method = ''
        if (status == "check") {
            url = `validateOrder/${model.id}`
            method = 'PUT'
        } else {
            url = `rejectOrder/${model.id}`
            method = 'PUT'
        }

        setLoader(true)
        try {
            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Une commande a ete mis a jour avec success", "Success");
                setLoader(false)
                getPendingData()
                getActivatedData()
                getRejectedData()
            } else {
                toastr.error("Veillez reessayez", "Erreur");
                setLoader(false)
                // window.location.reload()
            }
        } catch (error) {
            toastr.error("Veillez reessayez", "Erreur");
            setLoader(false)
        }
    }

    useEffect(() => {
        getAllData()
        getPendingData()
        getActivatedData()
        getRejectedData()
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
                                    <button className="nav-link active" id="pills-all-tab" data-bs-toggle="pill"
                                        data-bs-target="#pills-all" type="button" role="tab"
                                        aria-controls="pills-all" aria-selected="true">Toutes les Commandes</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="pills-details-tab" data-bs-toggle="pill"
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
                    <div className="tab-pane fade show active" id="pills-all" role="tabpanel"
                        aria-labelledby="pills-all-tab" tabindex="0">
                        <div className="card mt-24">
                            <div className="card-header border-bottom">
                                <h4 className="mb-4">Toutes les Commandes</h4>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width"> #</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Produits</th>
                                                    <th className="h6 text-gray-300">Quantité</th>
                                                    <th className="h6 text-gray-300">Agent</th>
                                                    <th className="h6 text-gray-300">Etat</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    allData.length > 0 ? (
                                                        allData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unit}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                                <td>
                                                                    {item.status == 'Pending' ? <span className="plan-badge py-4 px-16 bg-main-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-15">En attente</span> : ''}
                                                                    {item.status == 'Validated' ? <span className="plan-badge py-4 px-16 bg-warning-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-15">Validées</span> : ''}
                                                                    {item.status == 'Rejected' ? <span className="plan-badge py-4 px-16 bg-danger-600 text-white inset-inline-end-0 inset-block-start-0 mt-8 text-15">Rejetées</span> : ''}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr>
                                                        <td colSpan={7}>
                                                            <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                                        </td>
                                                    </tr>)
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="paginate mt-3 mb-8">
                                        <Pagination data={allEntries} limit={2} onPageChange={getResult} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* My Details Tab End */}

                    {/* My Details Tab start */}
                    <div className="tab-pane fade" id="pills-details" role="tabpanel"
                        aria-labelledby="pills-details-tab" tabindex="0">
                        <div className="card mt-24">
                            <div className="card-header border-bottom">
                                <h4 className="mb-4">Commandes en attente</h4>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width"> #</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Produits</th>
                                                    <th className="h6 text-gray-300">Quantité</th>
                                                    <th className="h6 text-gray-300">Agent</th>
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
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unit}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
                                                                <td>
                                                                    <button className="btn btn-success p-9 me-1" onClick={() => updateData("check", item)}><i className="ph ph-check text-white"></i></button>
                                                                    <button className="btn btn-danger p-9" onClick={() => updateData("reject", item)}><i className="ph ph-trash text-white"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr>
                                                        <td colSpan={7}>
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
                        </div>
                    </div>
                    {/* My Details Tab End */}

                    {/* Profile Tab Start */}
                    <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab"
                        tabindex="0">
                        <div className="card mt-24">
                            <div className="card-header border-bottom">
                                <h4 className="mb-4">Commandes validées </h4>
                            </div>
                            <div className="card-body">
                                <div className="card overflow-hidden">
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width">#</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Produits</th>
                                                    <th className="h6 text-gray-300">Quantité</th>
                                                    <th className="h6 text-gray-300">Agent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    validatedData.length > 0 ? (
                                                        validatedData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unit}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
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
                                    <div className="card-body overflow-x-auto">
                                        <table id="studentTable" className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-width">#</th>
                                                    <th className="h6 text-gray-300">Date</th>
                                                    <th className="h6 text-gray-300">Produits</th>
                                                    <th className="h6 text-gray-300">Quantité</th>
                                                    <th className="h6 text-gray-300">Agent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    rejectedData.length > 0 ? (
                                                        rejectedData.map((item, index) => (
                                                            <tr key={index}>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{formatDate(item.transaction_date)}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.quantity} {item.unit}</span></td>
                                                                <td><span className="h6 mb-0 fw-medium text-gray-300">{item.agent}</span></td>
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
    } else {
        return <RestoSupplyForm hideForm={hideForm} singleClient={singleClient} />
    }

}

export default RestaurantSupplyPage