import { useContext, useEffect, useState } from "react"
import { MainContext } from "../../../config/MainContext";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function SortieStockViewmore({ hideForm, singleClient }) {
    const [data, setData] = useState([])
    const { setLoader } = useContext(MainContext);

    const getData = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/getStoreOutletDetail/${singleClient.id}`, {
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
            const printData = data;
            var logo = new Image()
            logo.src = '/assets/images/logo.png'
            const pdf = new jsPDF();
            pdf.setProperties({
                title: "Detail transfert produits"
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
            pdf.text("DETAIL DU TRANSFERT DES PRODUITS", 55, 60);

            pdf.setFontSize(10);    
            pdf.setFont('custom', 'normal');
            pdf.text(`Date de l'operation : ${formatDate(singleClient.transaction_date)}`, 13, 70);
            pdf.text(`Departement : ${singleClient.service}`, 13, 75);
            pdf.text(`Agent : ${singleClient.agent}`, 13, 80);

            // Line width in units (you can adjust this)
            pdf.setLineWidth(0.1);

            // Generate AutoTable for item details
            const itemDetailsRows = printData?.map((item, index) => [
                (index + 1).toString(),
                item.product.toString(),
                item.output_quantity?.toString() + " " + item.unite?.toString()
            ]); 
            const itemDetailsHeaders = ['No', 'Produit', 'Qte'];
            const columnWidths = [25, 80, 80,];
            // Define table styles
            const headerStyles = {
                fillColor: [240, 240, 240],
                textColor: [0],
                fontFamily: 'Newsreader',
                fontStyle: 'bold',
            };
            pdf.setFont('Newsreader');
            const itemDetailsYStart = 87;
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
            pdf.save(`transfert produits.pdf`);
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
            {/* Breadcrumb Start */}
            <div className="breadcrumb-with-buttons mb-24 flex-between flex-wrap gap-8">
                {/* Breadcrumb Start */}
                <div className="breadcrumb mb-24">
                    <ul className="flex-align gap-4">
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Accueil</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><a href="/main" className="text-gray-200 fw-normal text-15 hover-text-main-600">Sortie Magasin</a></li>
                        <li> <span className="text-gray-500 fw-normal d-flex"><i className="ph ph-caret-right"></i></span> </li>
                        <li><span className="text-main-600 fw-normal text-15">Details</span></li>
                    </ul>
                </div>
                {/* Breadcrumb End */}

                {/* Breadcrumb Right Start */}
                <div className="flex-align gap-8 flex-wrap">
                    <div
                        className="flex-align text-gray-500 text-13 border border-gray-100 rounded-4 ">
                        <button className="btn btn-success me-1" onClick={() => downloadReport()}>Telecharger</button>
                        <button className="btn btn-primary" onClick={hideForm}>Retour</button>
                    </div>
                </div>
                {/* Breadcrumb Right End */}
            </div>
            {/* Breadcrumb End */}

            <div className="tab-content" id="pills-tabContent">
                {/* My Details Tab start */}
                <div className="tab-pane fade show active" id="pills-details" role="tabpanel"
                    aria-labelledby="pills-details-tab" tabIndex="0">
                    <div className="card mt-24">
                        <div className="card-header">
                            <span>Date de l'operation: {formatDate(singleClient.transaction_date)}</span><br />
                            <span>Departement: {singleClient.service}</span><br />
                            <span>Agent: {singleClient.agent}</span><br />
                        </div>
                        <div className="card-body">
                            <h4 className="d-flex justify-content-center">DETAIL DU  TRANSFERT DES PRODUITS</h4>
                            <div className="card overflow-hidden">
                                <div className="card-body overflow-x-auto">
                                    <table id="studentTable" className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th className="fixed-width"> #</th>
                                                <th className="h6 text-gray-300">Produit</th>
                                                <th className="h6 text-gray-300">Qte</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                data.length > 0 ? (
                                                    data.map((item, index) => (
                                                        <tr key={index}>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{index + 1}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.product}</span></td>
                                                            <td><span className="h6 mb-0 fw-medium text-gray-300">{item.output_quantity} {item.unite}</span></td>
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
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default SortieStockViewmore