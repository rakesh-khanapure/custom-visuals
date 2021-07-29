//import { BlobServiceClient } from "@azure/storage-blob";
//import powerbi from "powerbi-visuals-api";
import * as crypto from 'crypto';
import { Datum, ScatterData, PlotData, Layout, Margin, LayoutAxis, RangeSelector, Scene, ScatterMarkerLine, ScatterLine, PlotlyHTMLElement, Shape, newPlot, PlotMarker, ColorBar, Annotations, Config, Image, PlotDatum } from 'plotly.js/lib/core';
import $ from 'jquery';


//import IVisual = powerbi.extensibility.visual.IVisual;

export enum TPlotFilterType {
    TNum = 'TreatmentNumber',
    WellName = 'WellName'
}

export interface TPlotFilter {
    treatment: string,
    numAPI: string,
    UserName: string,
    EncryptionKey: string
}


class TreatmentPlot {
    //private target: HTMLElement;
    //private updateCount: number;
    //private settings: VisualSettings;
    //private textNode: Text;
    //private selectionManager: selectionManager;
    //private host: visualHost
    private filters: any = {};
    private plotData: any = [];
    private plotLayout: any = {};
    private PlotAnnotations = {};
    private blobServiceClient: any;

    private axisConfig: { xaxisField: any, yaxisFields: any } = {
        xaxisField: { fieldName: 'PumpTime', title: "Treatment Time", color: '#818F99' },
        yaxisFields: [
            { fieldName: 'SlurryRate', title: 'Rate [bbl/min]', color: '#32B877' },
            { fieldName: 'SlurryPropConc', title: 'Conc. [lb/gal]', color: '#D9623D' },
            { fieldName: 'BHProppantConc', title: 'BH Conc. [lb/gal]', color: '#6D1919' },
            { fieldName: 'TreatingPressure', title: 'Pressure [psi]', color: '#C71A2F' },
            { fieldName: 'Event', title: 'Event', color: '#b3b3b3' },
            { fieldName: 'StageDescription', title: 'StageDescription', color: '#FFFF00' }
        ]
    };
    private eventAxisLayout = '';

    constructor(){
        
    }

    private encrypt(text: any, EncryptionKey: any){
        const algorithm = 'aes-256-ctr'
        const secretKey=EncryptionKey
        const iv=crypto.randomBytes(16)
        const cipher=crypto.createCipheriv(algorithm, secretKey, iv)
        const encrypted=Buffer.concat([cipher.update(text), cipher.final()])
        return {
            i:iv.toString('hex'),
            c:encrypted.toString('hex')
        }
    }

    public getData(filters: any){
        // console.log('Filters ==> :', filters);
       /*  const numAPI = filters['numAPI'];
        const TreatmentNumbers = [filters['Treatment']];
        const UserEmail = filters['UserName'];
        const EncryptionKey = filters['EncryptionKey'];
        let domain=UserEmail.split('@')[1].toLowerCase()
        let encrypted=this.encrypt(`domain=${domain}&numAPI=${numAPI}&TreatmentNumbers=${TreatmentNumbers.join(', ')}`, EncryptionKey)
 */
        let REQUEST_URL=`/data.json`;

      /*   let REQUEST_URL=``+
        `&i=${encrypted.i}&c=${encrypted.c}` */
        
        return fetch(REQUEST_URL).then((res)=>{
            return res.json()
        }
        ).catch(err=> {
            console.log("Error when fetching treatment data API");
            this.showError();
            //throw err
        })
    }

    getProcessedPlotData = (response: any) : any => {
        this.setMaxRange(response.MaxJobPressure);
        let formattedData = this.setAxisDataForEachField(response.TimeHistory, response.EvenTable);
        this.plotLayout = this.getFieldLayout(formattedData);
        this.PlotAnnotations = this.getAnnotations(this.plotLayout, formattedData);
        this.plotData = formattedData;
        //this.checkboxInit();
        //this.setFeedbackProcess();
        return this.drawPlot(true, true);
    }

    public update(options: any) {


        /* this.filters = this.getFilters(options.dataViews[0].table);

        if(options.dataViews[0].table.rows.length != 1){
            let domainName = this.filters["UserName"].match(/(?<=@)[^.]+(?=\.)/)[0];
            let isHalliburton = domainName && domainName.toLowerCase() == 'halliburton';
            let errorMsg = "Please select a Customer, Well, and Treatment Number to see the Treatment Chart- See the Interval Comparison page to compare multiple treatments."

            if(!isHalliburton){
                errorMsg = "Please select a Well, and Treatment Number to see the Treatment Chart- See the Interval Comparison page to compare multiple treatments."
            }
            this.showError(errorMsg);
            return;
        } */
        // console.log(options.dataViews[0].table)
        // console.log(options.dataViews[0].table.rows[0][2], options.dataViews[0].table.rows[0][3])
        //************************************************************************************
        // We need to start Node API with node  [node NodeAPI.js] command and let it running...
        // Here need to provide the numAPI and TreamentNumber of Current Treatment 
        // i.e.replace constant values with variables to get the data from NodeAPI
        console.log('Requesting data from NodeAPI...')
        // let TreatmentData=this.getData(this.filters['First numAPI'], this.filters.Treatment);
        //let TreatmentData=this.getData(this.filters['First numAPI'], this.filters.Treatment)
        let TreatmentData = this.getData(this.filters);

        // let TreatmentData=this.getData(options.dataViews[0].table.rows[0][2], 7)
        TreatmentData.then((response) => {
            console.log("API response === >", JSON.stringify(response));
            this.setMaxRange(response.MaxJobPressure);
            let formattedData = this.setAxisDataForEachField(response.TimeHistory, response.EvenTable);
            this.plotLayout = this.getFieldLayout(formattedData);
            this.PlotAnnotations = this.getAnnotations(this.plotLayout, formattedData);
            this.plotData = formattedData;
            //this.checkboxInit();
            //this.setFeedbackProcess();
            this.drawPlot(true, true);
            //console.log("Plot data from Node", this.plotData, this.plotLayout);
        })
        .catch(err => {
            console.log("Error when fetching treatment data");
            this.showError();
        });
    }

    private setBlobServiceClient(): void {
        /* let STORAGE_ACCOUNT_NAME = 'peprotoappservi9a85'
        let SAS_TOKEN = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2030-04-14T00:53:10Z&st=2020-04-13T16:53:10Z&spr=https&sig=COYvL0bOYlKIMqJtM%2BMnAXfYS%2FLzjOovOFGZAGmAwKg%3D'
        this.blobServiceClient = new BlobServiceClient(
            `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net${SAS_TOKEN}`
        ); */
    }

    private setZoomInfoEvent(targetElem: any): void {
        /* let STORAGE_ACCOUNT_NAME = 'peprotoappservi9a85'
        let SAS_TOKEN = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2030-04-14T00:53:10Z&st=2020-04-13T16:53:10Z&spr=https&sig=COYvL0bOYlKIMqJtM%2BMnAXfYS%2FLzjOovOFGZAGmAwKg%3D'
        const blobServiceClient = this.blobServiceClient;

        //let targetElem: any = document.getElementById('graphDiv');
        var userEmail = this.filters["UserName"];
        var treatment = this.filters["Treatment"];
        var UserPrincipalName = userEmail.match(/^([^@]*)@/)[1];


        let self = this;
        targetElem.on('plotly_relayout',
            function (eventdata: any) {
                let xAxis = { "Treatment_Time": { "start": eventdata['xaxis.range[0]'], "end": eventdata['xaxis.range[1]'] } };
                let yData = {};
                self.getPlotInput().forEach((t: any, i: any) => {
                    if (i === 0) {
                        let yAxis = { "start": eventdata['yaxis.range[0]'], "end": eventdata[`yaxis.range[1]`] }
                        let name = t.name;
                        let final = { [name]: yAxis }
                        yData = { ...yData, ...final }
                    } else {
                        let name = t.name;
                        let yAxis = {
                            "start": eventdata[`yaxis${i + 1}.range[0]`],
                            "end": eventdata[`yaxis${i + 1}.range[1]`],
                        }
                        let final = { [name]: yAxis }
                        yData = { ...yData, ...final }

                    }

                })

                let operatorName = { Operator: userEmail.replace('.com', '').replace(`${UserPrincipalName}@`, '') };
                let emailData = { email: userEmail }
                let treatmentdata = { treatment_summary: treatment }
                const containerName = "usertrackingdev";
                let newDate = new Date();
                let minutes = String(new Date()).split(":")[1]
                let currentTime = { timestamp: newDate.getHours() + ":" + minutes + ":" + newDate.getSeconds() };
                let currentDay = (newDate.getMonth() + 1) + "-" + (newDate.getDate()) + "-" + newDate.getFullYear();
                let blobname = "Treatment Curve/" + UserPrincipalName + "/" + UserPrincipalName + currentTime.timestamp;

                let combineData = { ...xAxis, ...yData, ...operatorName, ...emailData, ...treatmentdata, ...currentTime }
                const containerClient = blobServiceClient.getContainerClient(containerName);
                const blobClient = containerClient.getBlobClient(blobname + ".json");


                blobClient.exists().then((exists: any) => {
                    if (exists == true) {
                        blobClient.download().then((dldBlbRes: any) => dldBlbRes.blobBody)
                            .then((blbRes: any) => {
                                blb2String(blbRes).then((resp) => {
                                    let parsed = JSON.parse(JSON.stringify(resp));
                                    let sampe = { one: 1 }
                                    let finaldata = { ...parsed, ...sampe }
                                    let new_data_str = JSON.stringify(finaldata);
                                    containerClient.uploadBlockBlob(blobname + ".json", new_data_str, new_data_str.length)
                                })

                            })
                    } else {
                        let new_data_str = JSON.stringify(combineData);
                        containerClient.uploadBlockBlob(blobname + ".json", new_data_str, new_data_str.length)
                    }
                })

                function blb2String(blob: any) {
                    const fileReader = new FileReader();
                    return new Promise((resolve, reject) => {
                        fileReader.onloadend = (ev: any) => {
                            resolve(ev.target['result']);
                        };
                        fileReader.onerror = reject;
                        fileReader.readAsText(blob);
                    });
                }

            }); */
    }

    private getFilters(tableData: any): any {
        let filters: any = {
            'Treatment': '',
            'numAPI': '',
            'UserName': '',
            'EncryptionKey':''
        };

        tableData.columns.forEach((item: any, index: any) => {
            if(Object.keys(filters).indexOf(item.displayName) !== -1){
                filters[item.displayName] = index;
            }
        })

        let rowObject = tableData.rows[0] || [];
        Object.keys(filters).forEach(item => {
            filters[item] = rowObject[filters[item]]
        })

        return filters;
    }

    setAxisDataForEachField(timeHistoryData: any, eventData: any): any {
        let dataByTreatmentNum: any = Object.values(timeHistoryData)[0];
        let eventByTreatmentNum: any = Object.values(eventData)[0];
        let eventOccurences = eventByTreatmentNum.map((eventInfo: any) => new Date(eventInfo.dTim).getTime());
        let columnsToExclude = ['First Email', 'First Operator'];
        let additionalDataColumns: any = []; //['numAPI', 'number'];
        let dataColumnList = [...additionalDataColumns,
        ...this.axisConfig.yaxisFields,
        this.axisConfig.xaxisField
        ];

        //let lineColors = ['#C71A2F', '#32B877', '#D9623D', '#6D1919', '#b3b3b3'];

        let axisData: any = {};
        let xaxisColumn = this.axisConfig.xaxisField;
        dataByTreatmentNum[xaxisColumn.fieldName] = (dataByTreatmentNum[xaxisColumn.fieldName] || [])
            .map((val: any) => this.getFieldTypeValue(xaxisColumn.fieldName, val))
        //let textColumn = dataColumns.find(col => col.fieldName == 'numAPI');
        //let colorColumn = dataColumns.find(col => col.fieldName == 'number');

        dataByTreatmentNum['Event'] = dataByTreatmentNum[xaxisColumn.fieldName].map((time: any) => {
            let _pumpTime = new Date(time).getTime();
            return eventOccurences.indexOf(_pumpTime) !== -1 ? 1 : 0;
        })

        // console.log("dataByTreatmentNum", dataByTreatmentNum);

        let index = 1;
        dataColumnList.forEach((column) => {
            if (additionalDataColumns.indexOf(column.fieldName) !== -1)
                return;

            let axisNum = index == 1 ? '' : index;
            axisData[column.fieldName] = axisData[column.fieldName] || {
                name: column.title,
                type: "scatter",
                xaxis: 'x',
                yaxis: `y${axisNum}`,
                x: dataByTreatmentNum[xaxisColumn.fieldName],
                y: dataByTreatmentNum[column.fieldName],
                text: [],
                line: {
                    "width": 2,
                    "color": column.color,
                    "dash": "solid"
                },
            };

            if (column.fieldName === xaxisColumn.fieldName) {
                axisData[column.fieldName].yaxis = 'y';
                //axisData[column.fieldName].line.color = xaxisColumn.color;
                /* axisData[column.fieldName].marker.colorscale = [
                    [0,this.plotBaseColors[0].start],
                    [1,this.plotBaseColors[0].end]
                ] */
            } else {
                //axisData[column.fieldName].line.color = lineColors[index];
                /* axisData[column.fieldName].marker.colorscale = [
                    [0,this.plotBaseColors[index].start],
                    [1,this.plotBaseColors[index].end]
                ] */
                index++;
            }
            //axisData[column.fieldName].text.push(`API : ${textVal} / TN : ${colorVal}`);
            //axisData[column.fieldName].marker.color.push(colorVal);

        });

        //e.log(axisData);
        return axisData;
    }

    private getFieldTypeValue(columnName: string, value: any): any {
        let columnDataTypeConfig = {
            'date': ['PumpTime'],
            'text': ['UniqueTreatmentIdentifier', 'StageDescription', 'numAPI'],
            'default': 'float'
        }
        let returnValue;
        let dataType = columnDataTypeConfig.date.indexOf(columnName) !== -1 ? 'date' :
            (columnDataTypeConfig.text.indexOf(columnName) !== -1 ? 'text' : 'float');

        switch (dataType) {
            case 'date':
                returnValue = value ? new Date(value) : '';
                break;
            case 'text':
                returnValue = value ? value.toString() : '';
                break;
            case 'float':
                returnValue = parseFloat(value)
                break;
            default:
                returnValue = parseFloat(value)
                break;
        }

        return returnValue;
    }

    getFieldLayout(axisData: any): any {
        let bgColor = '#1a2430';
        let plotLayout: any = {
            font: {
                family: "BarlowCondensed, monospace",
                color: "#818F99",
                size: 12
            },
            plot_bgcolor: 'transparent',
            scene: { bgcolor: bgColor },
            paper_bgcolor: bgColor,
            showlegend: true,
            legend: {
                borderwidth: 1,
                orientation: "h",
                y: 1.15,
                xanchor: "left",
                x: 0.05,
                font: { color: '#FFF' }
            },
            hovermode: 'closest',
            margin: { t: 25, r: 100, b: 5, l: 0 }
        };

        //let plotColors = ['#818F99', '#C71A2F', '#32B877','#D9623D', '#6D1919', '#b3b3b3', '#6D1919', '#DA5F56', '#DFA86F', '#999E79'];

        let index = 1;
        let side = 'right';
        let yaxis_leftPos = 0.12;
        let yaxis_rightPos = 0.94;

        let xaxisField = axisData[this.axisConfig.xaxisField.fieldName];
        xaxisField['line'] = { color: this.axisConfig.xaxisField.color };
        let xlayout: LayoutAxis = {
            domain: [
                yaxis_leftPos,
                yaxis_rightPos
            ],
            showgrid: false,
            position: 0.07,
            linecolor: this.axisConfig.xaxisField.color,
            color: this.axisConfig.xaxisField.color
        } as any;

        plotLayout['xaxis'] = xlayout;
        yaxis_rightPos -= 0.06;

        for (let _key in axisData) {
            let axisField: any = axisData[_key];

            if (_key !== this.axisConfig.xaxisField.fieldName) {
                //axisField['line'] = {color: axisField.line.color};
                side = side == 'right' ? 'left' : 'right';
                let ylayout: LayoutAxis = {
                    title: {
                        text: axisField.name,
                        standoff: 10, //this.settings.axis.axis_title_sandoff,
                    },
                    showgrid: false,
                    color: axisField.line.color,
                    linecolor: axisField.line.color,
                    zeroline: false,
                    tickformat: '',
                    rangemode: 'nonnegative', // nonnegative
                    side,
                    //position_per_axes + 1 - (axes_index_number * position_per_axes),
                    //range: [Math.min(...axisField.y), (Math.max(...axisField.y) * 1.1)],
                    domain: [0.07, 1]
                } as any;

                let axisConfig = this.axisConfig.yaxisFields.find((fld: any) => fld.fieldName === _key);

                if (axisConfig.maxRange) {
                    ylayout.range = [0, axisConfig.maxRange]
                }

                let axisNum = axisField.yaxis.replace('y', '');
                if (axisNum !== '') {
                    ylayout['overlaying'] = 'y';
                    ylayout['position'] = side == 'left' ? (yaxis_leftPos -= 0.07) : (yaxis_rightPos += 0.06)
                }
                if (_key === 'Event') {
                    this.eventAxisLayout = `yaxis${axisNum}`;
                    ylayout['position'] = (yaxis_rightPos+0.06);
                    ylayout.side = 'right';
                    ylayout.visible = false;
                }

                plotLayout[`yaxis${axisNum}`] = ylayout;
                index++;
            }

        }

        return plotLayout;
    }

    setMaxRange(MaxJobPressure: number): void {
        this.axisConfig.yaxisFields = this.axisConfig.yaxisFields.map((field: any) => {
            if (field.fieldName === 'TreatingPressure') {
                field.maxRange = MaxJobPressure <= 10000 ? 10000 : 15000;
            } else if (['SlurryPropConc', 'BHProppantConc'].indexOf(field.fieldName) !== -1) {
                field.maxRange = 10;
            } else if (field.fieldName === 'SlurryRate') {
                field.maxRange = 150;
            }
            return field;
        })
    }

    getAnnotations(layout: any, axisData: any): any {
        let stageDescData: any[] = axisData['StageDescription'].y || [];
        let pumpTimeData: any[] = axisData['StageDescription'].x || [];
        let shapes: any[] = [];
        let annotations: any[] = [];
        stageDescData.forEach((element, index) => {
            if (!annotations.find(annot => annot.text === element)) {
                shapes.push({
                    type: "line",
                    yref: "paper",
                    x0: pumpTimeData[index],
                    y0: 0.07,
                    x1: pumpTimeData[index],
                    y1: 1,
                    line: {
                        color: "#6b7b8f",
                        width: 1,
                        dash: "dot"
                    }
                });


                annotations.push({
                    font: {
                        "family": "\"Lucida Console\", Monaco, monospace"
                    },
                    x: pumpTimeData[index],
                    y: 1.05,
                    xref: "x",
                    yref: "paper",
                    text: element,
                    textangle: "-90",
                    showarrow: false,
                    bgcolor: "#4D1A33"
                })
            }

        });

        return { shapes, annotations };
    }

    private drawPlot(showStageDescriptions: boolean, showEvents: boolean): any {
        let layout = this.plotLayout;
        if (showStageDescriptions) {
            layout = { ...layout, ...this.PlotAnnotations }
        }
        let plotInput = this.getPlotInput(showStageDescriptions, showEvents);
        //const plotDiv: any = document.getElementById('graphDiv');
        //plotDiv.innerHTML = '';
        //Plotly.newPlot(plotDiv, plotInput, layout);
        ///this.setZoomInfoEvent(plotDiv);
        return {plotInput, layout};
    }

    private getPlotInput(showStageDescriptions?: any, showEvents?: any): any {
        let checkbox_sd: any = document.getElementById('chk_stageDescription');
        let checkbox_ev: any = document.getElementById('chk_event');

        showStageDescriptions = showStageDescriptions || checkbox_sd.checked;
        showEvents = showEvents || checkbox_ev.checkbox;

        //layout[this.eventAxisLayout].visible = showEvents;
        let excludeFromPlot = [this.axisConfig.xaxisField.title, 'StageDescription'];
        excludeFromPlot.push(showEvents ? '' : 'Event');
        let plotInput = Object.values(this.plotData).filter((field: any) => excludeFromPlot.indexOf(field.name) === -1);
        return plotInput;
    }


    /* private createHTML(): void {

        this.target.innerHTML = `
        <div class="customBox" id="customContainer">
            <div class="optionsContainer">
                <div class="toggleDiv">
                    <input type="checkbox" checked id="chk_stageDescription" name="stageDescription">
                    <label for="chk_stageDescription"> Toggle Stage Description </label><br>
                </div>
                <div class="toggleDiv">
                    <input type="checkbox" checked id="chk_event" name="Event">
                    <label for="chk_event"> Toggle Event </label><br>
                </div>
            </div>
            <div id="graphDiv">
            </div>
        </div>
        `;

        setTimeout(() => {
            let checkbox_sd = document.getElementById('chk_stageDescription');
            checkbox_sd.removeEventListener('change', this.toggleStageDescriptions);
            checkbox_sd.addEventListener('change', this.toggleStageDescriptions.bind(this))

            let checkbox_ev = document.getElementById('chk_event');
            checkbox_ev.removeEventListener('change', this.toggleEvent);
            checkbox_ev.addEventListener('change', this.toggleEvent.bind(this))
        }, 500);

    } */

    /* private setFeedbackProcess() {
        let isFeedbackAdded = $('#feedbackModal').length > 0;
        if(!isFeedbackAdded) {
            let initData: FeedbackInitData = {username: this.filters["UserName"], visualName: 'TreatmentPlot'};
            let feedback =  new Feedback('#customContainer', this.blobServiceClient, initData);
            $('.textBlock').next().addBack().addClass('col').wrapAll('<div class="form-row"></div>');
        }
    } */

    private checkboxInit(): void {
        let checkbox_sd: any = document.getElementById('chk_stageDescription');
        let checkbox_ev: any = document.getElementById('chk_event');
        checkbox_sd.checked = true;
        checkbox_ev.checked = true;
    }

    /* private toggleStageDescriptions(event): void {
        let evt_checkbox: any = document.getElementById('chk_event');
        if (event.target.checked) {
            this.drawPlot(true, evt_checkbox.checked);
        } else {
            this.drawPlot(false, evt_checkbox.checked);
        }
    }

    private toggleEvent(event): void {
        let sd_checkbox: any = document.getElementById('chk_stageDescription');
        if (event.target.checked) {
            this.drawPlot(sd_checkbox.checked, true);
        } else {
            this.drawPlot(sd_checkbox.checked, false);
        }
    }*/

    private showError(errMsg?:string): void {
        let errorMessage = errMsg? errMsg : 'Sorry something wrong, please reload the page, if the problem persists contact <span class="emailText">FracVault@halliburton.com</span>';
        let graphDiv: any = document.getElementById('graphDiv');
        graphDiv.innerHTML = `<div class='errorDiv'>${errorMessage}</div>`;
        $('#customContainer .optionsContainer').hide();   
    } 
}

export default TreatmentPlot