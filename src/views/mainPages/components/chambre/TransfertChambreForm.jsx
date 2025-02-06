import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../../config/MainContext";

function TransfertChambreForm({hideForm, singleRoom}) {
    const [clientData, setclientData] = useState([])
    const { setLoader } = useContext(MainContext);
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    const [form, setForm] = useState({
        origin_room_id: singleRoom.id,
        destination_room_id:""
    })

    const submitData = async () => {

        let url = `createTransfer`
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
                toastr.success("Un client a ete transfere avec success", "Success");
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

    const getRoomOptions = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getRoomOptions`, {
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

    useEffect(()=>{
        getRoomOptions()
    },[])

    return <>
        <div className="row">
            <h4>Transferer le client de sa chambre</h4>
            <div className="col-sm-12 col-xs-12 mb-8">
                <label htmlFor="email" className="form-label mb-8 h6">Chambre de transfert</label>
                <select id="" value={form.destination_room_id} onChange={(e) => { setForm({ ...form, destination_room_id: e.target.value }) }} className="form-control py-11">
                    <option hidden>Selectionnez une chambre</option>
                    {clientData.map((item, index) => (
                        <option value={item.id} key={index}>{item.designation} - {item.categorie}</option>
                    ))}
                </select>
            </div>

            <div className="col-sm-12">
                <button className="btn btn-outline-danger bg-danger-100 border-danger-100 text-danger-600 rounded-pill py-9 me-1" onClick={hideForm}>Annuler</button>
                <button type="button" className="btn btn-main rounded-pill py-9" onClick={submitData}>Enregistrer</button>
            </div>
            
        </div>

    </>
}

export default TransfertChambreForm