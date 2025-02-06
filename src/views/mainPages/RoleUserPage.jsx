import { useContext, useEffect, useState } from "react"
import Modal from 'react-bootstrap/Modal';
import { MainContext } from "../../config/MainContext"

function RoleUserPage() {
    const [formVisible, setFormVisible] = useState(false)
    const [singleClient, setSingleClient] = useState({})
    const [data, setData] = useState([])
    const [singleRole, setsingleRole] = useState([])
    const { setLoader } = useContext(MainContext);
    const [permissions, setPermissions] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [form, setForm] = useState({
        designation: ""
    })

    const hideForm = () => {
        setFormVisible(false)
        getData();
        Object.keys(singleClient).forEach(function (key, index) {
            delete singleClient[key];
        });
    }

    const handlePermissionChange = (e) => {
        const permissionId = e.target.value;


        if (e.target.checked) {
            console.log(`${permissionId}:`, e.target.checked)
            setSelectedPermissions([...selectedPermissions, permissionId]); // Add ID to array
        } else {
            setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId)); // Remove ID from array
        }

        console.log("ID FOR ROLES:", selectedPermissions)
    };

    const getData = async (page = 1, q = '') => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoleOptions?page=${page}&q=${q}`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATAs:", res.data)
            if (res.data) {
                setData(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    const submitData = async (e) => {
        e.preventDefault()

        let url = `createRole`
        let method = 'POST'
        if (singleRole.id) {
            url = `updateRole/${singleRole.id}`
            method = 'PUT'
            // insertUpdateFn(url, method, form)
        }

        let generalForm = {}
        generalForm.name = roleName;
        generalForm.permissions = [];
        generalForm.permissions = selectedPermissions;

        setLoader(true)
        try {
            const response = await fetch(`${BaseUrl}/${url}`, {
                method: method,
                headers: headerRequest,
                body: JSON.stringify(generalForm),
            });
            const res = await response.json();
            if (res.success) {
                toastr.success("Un role a ete insere avec success", "Success");
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

    const searchDataFn = (searchData) => {
        if (searchData) {
            let term = searchData.toLowerCase();
            getData(1,term);
        } else {
            getData();
        }
    };

    const modelUpdate = async (model) => {

		try {
			setLoader(true)
			const response = await fetch(`${BaseUrl}/getPermissionDataByRole/${model.id}`, {
				method: 'GET',
				headers: headerRequest
			});
			const res = await response.json();
			if (res.data) {
				setSelectedPermissions(res.data);
				setRoleName(model.name)
				setsingleRole(model)
				setFormVisible(true)
			}
			setLoader(false)
		} catch (error) {
			console.error("ERROR:", error);
			setLoader(false)
		}

	}


    const getPermissionData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getPemissionData`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            console.log("DATA:", res.data)
            if (res.data) {
                setPermissions(res.data);
            }
            setLoader(false)
        } catch (error) {
            console.error("ERROR:", error);
            setLoader(false)
        }
    }

    useEffect(() => {
        getData()
        getPermissionData()
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
                        <li><span className="text-main-600 fw-normal text-15">Role des utilisateurs</span></li>
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
                        <button className="btn btn-primary" onClick={() => setFormVisible(true)}>Ajouter</button>
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
                                <th className="h6 text-gray-300">Designation</th>
                                <th className="h6 text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.name}</span></td>
                                            <td>
                                                <button className="btn btn-main p-9 me-1" onClick={() => modelUpdate(item)}><i className="ph ph-pen text-white"></i></button>
                                                <button className="btn btn-danger p-9" onClick={() => modelDelete(item)}><i className="ph ph-trash text-white"></i></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (<tr>
                                    <td colSpan={3}>
                                        <i className="h6 mb-0 fw-medium text-gray-300 d-flex justify-content-center">Aucun élément trouvé</i>
                                    </td>
                                </tr>)

                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <Modal show={formVisible} onHide={hideForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{`${singleRole.id?'Modifier':'Nouveau'}`} role</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="col-sm-12 col-xs-12">
                    <label for="address" className="form-label mb-8 h6">Designation</label>
                    <input type="text" className="form-control py-11" id="address" value={roleName} onChange={(e) => { setRoleName(e.target.value) }}
                        placeholder="Entrer une designation" />
                </div>
                <div className="col-sm-12 col-xs-12">
                    <label for="address" className="form-label mb-8 h6 mt-8">Permissions</label>
                    {permissions.map((item, index) => (
                        <div className="form-check" key={index}>
                            <input className="form-check-input" type="checkbox" id={`formCheck${index}`} checked={selectedPermissions.includes(item.name)} value={item.name} onChange={handlePermissionChange} />
                            <label className="form-check-label" htmlFor={`formCheck${index}`} style={{fontWeight:0}}>
                                {item.name}
                            </label>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>{`${singleRole.id?'Modifier':'Enregistrer'}`}</button>
            </Modal.Footer>
        </Modal>
    </>

}

export default RoleUserPage