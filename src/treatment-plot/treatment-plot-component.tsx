import React, { ChangeEvent, useEffect } from "react";
import Plot from 'react-plotly.js';
import { useDispatch } from "react-redux";
import TreatmentPlot, { TPlotFilter, TPlotFilterType } from "./TreatmentPlot";
import './treatment-plot-style.scss';

interface TreatmentPlotComponentProps {
    //createPlot(plotData: any): void;
}

export const TreatmentPlotComponent: React.FC<TreatmentPlotComponentProps> = ({ }) => {
    let treatmentPlotInst = new TreatmentPlot();
    const plotContainerStyle = {
        width: '100%'
    };

    const wellNames = [
        'Well 01', 'Well 02', 'Well 03'
    ]
    const treatmentNumers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    let filters: TPlotFilter = {
        UserName: 'yash.patel2@halliburton.com',
        numAPI: '1234',
        treatment: '1',
        EncryptionKey: 'eKey'
    } 


    const dispatch = useDispatch();
    const [selectedWell, setSelectedWell] = React.useState('Select Well');
    const [tNum, setTNum] = React.useState(1);
    const [plotData, setPlotData] = React.useState([]);
    const [plotLayout, setPlotLayout] = React.useState({});


    const getTreatmentData = (filterObj: TPlotFilter) => {
        let TreatmentData = treatmentPlotInst.getData({});

        // let TreatmentData=getData(options.dataViews[0].table.rows[0][2], 7)
        TreatmentData.then((response) => {
            const { plotInput, layout } = treatmentPlotInst.getProcessedPlotData(response);
            setPlotData(plotInput);
            setPlotLayout(layout);
        })
            .catch(err => {
                console.log("Error when fetching treatment data");
                //showError();
            });
    }

    const filterChange = (value: any, filterType: TPlotFilterType) => {
        if(filterType === TPlotFilterType.TNum){
            setTNum(value);
        } else {
            setSelectedWell(value);
        }

        if(tNum && selectedWell && selectedWell !== 'Select Well'){
            let changedFilters: TPlotFilter = {...filters, treatment: tNum.toString()};
            getTreatmentData(filters);
        }
    }

    useEffect(() => {
        getTreatmentData(filters);
    }, [])


    return (
        <div className="customBox" id="customContainer">
            <div className="filterContainer">
                <div className="dropdown">
                    <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        {selectedWell}
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a className="dropdown-item">Select Well</a></li>
                        {wellNames.map(well =>
                            <li><a onClick={() => filterChange(well, TPlotFilterType.WellName)} className="dropdown-item" href="#">{well}</a></li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="optionsContainer">
                <div className="toggleDiv">
                    <input type="checkbox" checked id="chk_stageDescription" name="stageDescription" />
                    <label htmlFor="chk_stageDescription"> Toggle Stage Description </label><br />
                </div>
                <div className="toggleDiv">
                    <input type="checkbox" checked id="chk_event" name="Event" />
                    <label htmlFor="chk_event"> Toggle Event </label><br />
                </div>
            </div>
            <div className="plotContainer">
                <Plot style={plotContainerStyle} className="treatment-plot"
                    data={plotData}
                    layout={plotLayout}
                />
                <div className="treatmentFilterContainer">
                    {treatmentNumers.map(num => <button onClick={() => filterChange(num, TPlotFilterType.TNum)} className={`btn ${tNum === num? 'btn-secondary' : 'btn-outline-secondary'}`}>{num}</button>)}
                </div>
            </div>
        </div>
    );

}