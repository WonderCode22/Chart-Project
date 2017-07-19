(function() {
    var e = window.AmCharts;
    e.AmStockChart = e.Class({
        construct: function(a) {
            this.type = "stock";
            this.cname = "AmStockChart";
            e.addChart(this);
            this.version = "3.20.17";
            this.theme = a;
            this.createEvents("buildStarted", "zoomed", "rollOverStockEvent", "rollOutStockEvent", "clickStockEvent", "panelRemoved", "dataUpdated", "init", "rendered", "drawn", "resized");
            this.colors = "#FF6600 #FCD202 #B0DE09 #0D8ECF #2A0CD0 #CD0D74 #CC0000 #00CC00 #0000CC #DDDDDD #999999 #333333 #990000".split(" ");
            this.firstDayOfWeek = 1;
            this.glueToTheEnd = !1;
            this.dataSetCounter = -1;
            this.zoomOutOnDataSetChange = !1;
            this.panels = [];
            this.dataSets = [];
            this.chartCursors = [];
            this.comparedDataSets = [];
            this.classNamePrefix = "amcharts";
            this.categoryAxesSettings = new e.CategoryAxesSettings(a);
            this.valueAxesSettings = new e.ValueAxesSettings(a);
            this.panelsSettings = new e.PanelsSettings(a);
            this.chartScrollbarSettings = new e.ChartScrollbarSettings(a);
            this.chartCursorSettings = new e.ChartCursorSettings(a);
            this.stockEventsSettings = new e.StockEventsSettings(a);
            this.legendSettings =
                new e.LegendSettings(a);
            this.balloon = new e.AmBalloon(a);
            this.previousEndDate = new Date(0);
            this.previousStartDate = new Date(0);
            this.dataSetCount = this.graphCount = 0;
            this.chartCreated = !1;
            this.processTimeout = 0;
            this.autoResize = this.extendToFullPeriod = !0;
            this.langObj = {};
            e.applyTheme(this, a, this.cname)
        },
        write: function(a) {
            var b = this;
            if (b.listeners)
                for (var c in b.listeners) { var d = b.listeners[c];
                    b.addListener(d.event, d.method) }
            b.fire({ type: "buildStarted", chart: b });
            b.afterWriteTO && clearTimeout(b.afterWriteTO);
            0 < b.processTimeout ? b.afterWriteTO = setTimeout(function() { b.afterWrite.call(b, a) }, b.processTimeout) : b.afterWrite(a)
        },
        afterWrite: function(a) {
            var b = this.theme;
            window.AmCharts_path && (this.path = window.AmCharts_path);
            void 0 === this.path && (this.path = e.getPath());
            void 0 === this.path && (this.path = "amcharts/");
            this.path = e.normalizeUrl(this.path);
            void 0 === this.pathToImages && (this.pathToImages = this.path + "images/");
            this.initHC || (e.callInitHandler(this), this.initHC = !0);
            e.applyLang(this.language, this);
            this.chartCursors = [];
            var c = this.exportConfig;
            c && e.AmExport && !this.AmExport && (this.AmExport = new e.AmExport(this, c));
            this.amExport && e.AmExport && (this.AmExport = e.extend(this.amExport, new e.AmExport(this), !0));
            this.AmExport && this.AmExport.init();
            this.chartRendered = !1;
            a = "object" != typeof a ? document.getElementById(a) : a;
            this.zoomOutOnDataSetChange && (this.endDate = this.startDate = void 0);
            this.categoryAxesSettings = e.processObject(this.categoryAxesSettings, e.CategoryAxesSettings, b);
            this.valueAxesSettings = e.processObject(this.valueAxesSettings,
                e.ValueAxesSettings, b);
            this.chartCursorSettings = e.processObject(this.chartCursorSettings, e.ChartCursorSettings, b);
            this.chartScrollbarSettings = e.processObject(this.chartScrollbarSettings, e.ChartScrollbarSettings, b);
            this.legendSettings = e.processObject(this.legendSettings, e.LegendSettings, b);
            this.panelsSettings = e.processObject(this.panelsSettings, e.PanelsSettings, b);
            this.stockEventsSettings = e.processObject(this.stockEventsSettings, e.StockEventsSettings, b);
            this.dataSetSelector && (this.dataSetSelector =
                e.processObject(this.dataSetSelector, e.DataSetSelector, b));
            this.periodSelector && (this.periodSelector = e.processObject(this.periodSelector, e.PeriodSelector, b));
            a.innerHTML = "";
            this.div = a;
            this.measure();
            this.createLayout();
            this.updateDataSets();
            this.addDataSetSelector();
            this.addPeriodSelector();
            this.addPanels();
            this.updatePanels();
            this.addChartScrollbar();
            this.updateData();
            this.skipDefault || this.setDefaultPeriod();
            this.skipEvents = !1
        },
        setDefaultPeriod: function() {
            var a = this.periodSelector;
            a && (this.animationPlayed = !1, a.setDefaultPeriod())
        },
        validateSize: function() { this.measurePanels() },
        updateDataSets: function() { var a = this.mainDataSet,
                b = this.dataSets,
                c; for (c = 0; c < b.length; c++) { var d = b[c],
                    d = e.processObject(d, e.DataSet);
                b[c] = d;
                d.id || (this.dataSetCount++, d.id = "ds" + this.dataSetCount);
                void 0 === d.color && (d.color = this.colors.length - 1 > c ? this.colors[c] : e.randomColor()) }!a && e.ifArray(b) && (this.mainDataSet = this.dataSets[0]);
            this.getSelections() },
        getLastDate: function(a) {
            var b = e.getDate(a, this.dataDateFormat, "fff");
            a = this.categoryAxesSettings.minPeriod;
            b = e.changeDate(b, this.categoryAxesSettings.minPeriod, 1, !0).getTime(); - 1 == a.indexOf("fff") && --b;
            return new Date(b)
        },
        getFirstDate: function(a) { a = e.getDate(a, this.dataDateFormat, "fff"); return new Date(e.resetDateToMin(a, this.categoryAxesSettings.minPeriod, 1, this.firstDayOfWeek)) },
        updateData: function() {
            var a = this,
                b = a.mainDataSet;
            if (b) {
                a.parsingData = !1;
                var c = a.categoryAxesSettings; - 1 == e.getItemIndex(c.minPeriod, c.groupToPeriods) && c.groupToPeriods.unshift(c.minPeriod);
                var d = b.dataProvider;
                if (e.ifArray(d)) {
                    var k =
                        b.categoryField;
                    a.firstDate = a.getFirstDate(d[0][k]);
                    a.lastDate = a.getLastDate(d[d.length - 1][k]);
                    a.periodSelector && a.periodSelector.setRanges(a.firstDate, a.lastDate);
                    b.dataParsed || (a.parsingData = !0, 0 < a.processTimeout ? setTimeout(function() { a.parseStockData.call(a, b, c.minPeriod, c.groupToPeriods, a.firstDayOfWeek, a.dataDateFormat) }, a.processTimeout) : a.parseStockData(b, c.minPeriod, c.groupToPeriods, a.firstDayOfWeek, a.dataDateFormat));
                    this.updateComparingData()
                } else a.firstDate = void 0, a.lastDate = void 0;
                a.fixGlue();
                if (!a.parsingData) a.onDataUpdated()
            }
        },
        fixGlue: function() { if (this.glueToTheEnd && this.startDate && this.endDate && this.lastDate) { this.startDate = new Date(this.startDate.getTime() + (this.lastDate.getTime() - this.endDate.getTime()) + 1); var a = e.extractPeriod(this.categoryAxesSettings.minPeriod);
                this.startDate = e.resetDateToMin(this.startDate, a.period, a.count, this.firstDayOfWeek);
                this.endDate = this.lastDate;
                this.updateScrollbar = !0 } },
        isDataParsed: function() {
            if (this.mainDataSet) {
                for (var a = !0, b = 0; b < this.comparedDataSets.length; b++) this.comparedDataSets[b].dataParsed ||
                    (a = !1);
                if (this.mainDataSet.dataParsed && a) return !0
            }
            return !1
        },
        onDataUpdated: function() { this.isDataParsed() && (this.updatePanelsWithNewData(), this.skipEvents || this.fire({ type: "dataUpdated", chart: this })) },
        updateComparingData: function() { var a = this.comparedDataSets,
                b = this.categoryAxesSettings,
                c; for (c = 0; c < a.length; c++) { var d = a[c];
                d.dataParsed || (this.parsingData = !0, 0 < this.processTimeout ? this.delayedParseStockData(c, d) : this.parseStockData(d, b.minPeriod, b.groupToPeriods, this.firstDayOfWeek, this.dataDateFormat)) } },
        delayedParseStockData: function(a, b) { var c = this,
                d = c.categoryAxesSettings;
            setTimeout(function() { c.parseStockData.call(c, b, d.minPeriod, d.groupToPeriods, c.firstDayOfWeek, c.dataDateFormat) }, c.processTimeout * a) },
        parseStockData: function(a, b, c, d, k) {
            var g = this,
                m = {},
                h = a.dataProvider,
                p = a.categoryField;
            if (p) {
                var f = e.getItemIndex(b, c),
                    l = c.length,
                    n, r = h.length,
                    t, y = {};
                for (n = f; n < l; n++) t = c[n], m[t] = [];
                var v = {},
                    A = a.fieldMappings,
                    E = A.length;
                for (n = 0; n < r; n++) {
                    var B = h[n],
                        D = e.getDate(B[p], k, b),
                        C = D.getTime(),
                        q = {},
                        z;
                    for (z =
                        0; z < E; z++) q[A[z].toField] = B[A[z].fromField];
                    for (z = f; z < l; z++) {
                        t = c[z];
                        var u = e.extractPeriod(t),
                            F = u.period,
                            G = u.count,
                            w, x;
                        if (z == f || C >= y[t] || !y[t]) {
                            v[t] = {};
                            v[t].amCategoryIdField = String(e.resetDateToMin(D, F, G, d).getTime());
                            var H;
                            for (H = 0; H < E; H++) u = A[H].toField, w = v[t], null !== q[u] && (x = Number(q[u]), w[u + "Count"] = 0, isNaN(x) || (w[u + "Open"] = x, w[u + "Sum"] = x, w[u + "High"] = x, w[u + "AbsHigh"] = x, w[u + "Low"] = x, w[u + "Close"] = x, w[u + "Count"] = 1, w[u + "Average"] = x));
                            w.dataContext = B;
                            w.rawData = [];
                            w.rawData.push(B);
                            m[t].push(v[t]);
                            z >
                                f && (u = e.newDate(D, b), u = e.changeDate(u, F, G, !0), u = e.resetDateToMin(u, F, G, d), y[t] = u.getTime());
                            if (z == f)
                                for (var I in B) B.hasOwnProperty(I) && (v[t][I] = B[I]);
                            v[t][p] = e.newDate(D, b)
                        } else
                            for (w = v[t], w.rawData && w.rawData.push(B), t = 0; t < E; t++) u = A[t].toField, n == r - 1 && (w[p] = e.newDate(D, b)), null !== q[u] && (x = Number(q[u]), isNaN(x) || (isNaN(w[u + "Low"]) && (w[u + "Low"] = x), x < w[u + "Low"] && (w[u + "Low"] = x), isNaN(w[u + "High"]) && (w[u + "High"] = x), x > w[u + "High"] && (w[u + "High"] = x), isNaN(w[u + "AbsHigh"]) && (w[u + "AbsHigh"] = x), Math.abs(x) > w[u +
                                "AbsHigh"] && (w[u + "AbsHigh"] = x), w[u + "Close"] = x, F = e.getDecimals(w[u + "Sum"]), G = e.getDecimals(x), isNaN(w[u + "Sum"]) && (w[u + "Sum"] = 0), w[u + "Sum"] += x, w[u + "Sum"] = e.roundTo(w[u + "Sum"], Math.max(F, G)), w[u + "Count"]++, w[u + "Average"] = w[u + "Sum"] / w[u + "Count"]))
                    }
                }
            }
            a.agregatedDataProviders = m;
            e.ifArray(a.stockEvents) ? 0 < g.processTimeout ? setTimeout(function() { g.parseEvents.call(g, a, g.panels, g.stockEventsSettings, g.firstDayOfWeek, g, g.dataDateFormat) }, g.processTimeout) : g.parseEvents(a, g.panels, g.stockEventsSettings, g.firstDayOfWeek,
                g, g.dataDateFormat) : (a.dataParsed = !0, g.onDataUpdated())
        },
        parseEvents: function(a, b, c, d, k, g) {
            d = a.stockEvents;
            var m = a.agregatedDataProviders,
                h = b.length,
                p, f, l, n, r, t;
            for (p = 0; p < h; p++) { t = b[p];
                r = t.graphs;
                l = r.length; for (f = 0; f < l; f++) n = r[f], n.customBulletField = "amCustomBullet" + n.id + "_" + t.id, n.bulletConfigField = "amCustomBulletConfig" + n.id + "_" + t.id, n.chart = t; for (f = 0; f < d.length; f++) l = d[f], n = l.graph, e.isString(n) && (n = e.getObjById(r, n)) && (l.graph = n), n && (l.panel = n.chart) }
            for (var y in m)
                if (m.hasOwnProperty(y))
                    for (b =
                        m[y], h = e.extractPeriod(y), p = b.length, f = 0; f < d.length; f++) {
                        l = d[f];
                        n = l.date instanceof Date;
                        g && !n && (l.date = e.stringToDate(l.date, g));
                        n = l.date.getTime();
                        var v = this.getEventDataItem(n, b, a, 0, p, h);
                        v && (n = l.graph, t = l.panel, r = "amCustomBullet" + n.id + "_" + t.id, t = "amCustomBulletConfig" + n.id + "_" + t.id, n && (v[t] ? n = v[t] : (n = {}, n.eventDispatcher = k, n.eventObjects = [], n.letters = [], n.descriptions = [], n.shapes = [], n.backgroundColors = [], n.backgroundAlphas = [], n.borderColors = [], n.borderAlphas = [], n.colors = [], n.rollOverColors = [],
                                n.showOnAxis = [], n.values = [], n.showAts = [], n.fontSizes = [], n.showBullets = [], v[r] = e.StackedBullet, v[t] = n), n.eventObjects.push(l), n.letters.push(l.text), n.descriptions.push(l.description), l.type ? n.shapes.push(l.type) : n.shapes.push(c.type), void 0 !== l.backgroundColor ? n.backgroundColors.push(l.backgroundColor) : n.backgroundColors.push(c.backgroundColor), isNaN(l.backgroundAlpha) ? n.backgroundAlphas.push(c.backgroundAlpha) : n.backgroundAlphas.push(l.backgroundAlpha), isNaN(l.borderAlpha) ? n.borderAlphas.push(c.borderAlpha) :
                            n.borderAlphas.push(l.borderAlpha), void 0 !== l.borderColor ? n.borderColors.push(l.borderColor) : n.borderColors.push(c.borderColor), void 0 !== l.rollOverColor ? n.rollOverColors.push(l.rollOverColor) : n.rollOverColors.push(c.rollOverColor), void 0 !== l.showAt ? n.showAts.push(l.showAt) : n.showAts.push(c.showAt), void 0 !== l.fontSize && n.fontSizes.push(l.fontSize), n.colors.push(l.color), n.values.push(l.value), n.showOnAxis.push(l.showOnAxis), n.showBullets.push(l.showBullet), n.date = new Date(l.date)))
                    }
                a.dataParsed = !0;
            this.onDataUpdated()
        },
        getEventDataItem: function(a, b, c, d, k, g) {
            var m = g.period,
                h = g.count,
                p = Math.floor(d + (k - d) / 2),
                f = b[p],
                l = f[c.categoryField],
                n = this.dataDateFormat,
                r = l instanceof Date;
            n && !r && (l = e.stringToDate(l, n));
            n = l.getTime();
            "YYYY" == m && (n = e.resetDateToMin(new Date(l), m, h, this.firstDayOfWeek).getTime());
            m = "fff" == m ? l.getTime() + 1 : e.resetDateToMin(e.changeDate(new Date(l), g.period, g.count), m, h, this.firstDayOfWeek).getTime();
            if (a >= n && a < m) return f;
            if (!(1 >= k - d)) return a < n ? this.getEventDataItem(a, b, c, d, p,
                g) : this.getEventDataItem(a, b, c, p, k, g)
        },
        createLayout: function() {
            var a = this.div,
                b, c, d = this.classNamePrefix,
                e = document.createElement("div");
            e.style.position = "relative";
            this.containerDiv = e;
            e.className = d + "-stock-div";
            a.appendChild(e);
            if (a = this.periodSelector) b = a.position;
            if (a = this.dataSetSelector) c = a.position;
            if ("left" == b || "left" == c) a = document.createElement("div"), a.className = d + "-left-div", a.style.cssFloat = "left", a.style.styleFloat = "left", a.style.width = "0px", a.style.position = "absolute", e.appendChild(a),
                this.leftContainer = a;
            if ("right" == b || "right" == c) b = document.createElement("div"), b.className = d + "-right-div", b.style.cssFloat = "right", b.style.styleFloat = "right", b.style.width = "0px", e.appendChild(b), this.rightContainer = b;
            b = document.createElement("div");
            b.className = d + "-center-div";
            e.appendChild(b);
            this.centerContainer = b;
            e = document.createElement("div");
            e.className = d + "-panels-div";
            b.appendChild(e);
            this.panelsContainer = e
        },
        addPanels: function() {
            this.measurePanels(!0);
            for (var a = this.panels, b = 0; b < a.length; b++) {
                var c =
                    a[b],
                    c = e.processObject(c, e.StockPanel, this.theme, !0);
                a[b] = c;
                this.addStockPanel(c, b)
            }
            this.panelsAdded = !0
        },
        measurePanels: function(a) {
            this.measure();
            var b = this.chartScrollbarSettings,
                c = this.divRealHeight,
                d = this.divRealWidth;
            if (this.div) {
                var e = this.panelsSettings.panelSpacing;
                b.enabled && (c -= b.height);
                (b = this.periodSelector) && !b.vertical && (b = b.offsetHeight, c -= b + e);
                (b = this.dataSetSelector) && !b.vertical && (b = b.offsetHeight, c -= b + e);
                a || c == this.prevPH && this.prevPW == d || this.fire({ type: "resized", chart: this });
                this.prevPW != d && (this.prevPW = d);
                if (c != this.prevPH) { a = this.panels;
                    0 < c && (this.panelsContainer.style.height = c + "px"); for (var d = 0, g, b = 0; b < a.length; b++)
                        if (g = a[b]) { var m = g.percentHeight;
                            isNaN(m) && (m = 100 / a.length, g.percentHeight = m);
                            d += m }
                    this.panelsHeight = Math.max(c - e * (a.length - 1), 0); for (b = 0; b < a.length; b++)
                        if (g = a[b]) g.percentHeight = g.percentHeight / d * 100, g.panelBox && (g.panelBox.style.height = Math.round(g.percentHeight * this.panelsHeight / 100) + "px");
                    this.prevPH = c }
            }
        },
        addStockPanel: function(a, b) {
            var c = this.panelsSettings,
                d = document.createElement("div");
            0 < b && !this.panels[b - 1].showCategoryAxis && (d.style.marginTop = c.panelSpacing + "px");
            a.hideBalloonReal();
            a.panelBox = d;
            a.stockChart = this;
            a.langObj = this.langObj;
            a.id || (a.id = "stockPanel" + b);
            d.className = "amChartsPanel " + this.classNamePrefix + "-stock-panel-div " + this.classNamePrefix + "-stock-panel-div-" + a.id;
            a.pathToImages = this.pathToImages;
            a.path = this.path;
            d.style.height = Math.round(a.percentHeight * this.panelsHeight / 100) + "px";
            d.style.width = "100%";
            this.panelsContainer.appendChild(d);
            0 < c.backgroundAlpha && (d.style.backgroundColor = c.backgroundColor);
            if (d = a.stockLegend) d = e.processObject(d, e.StockLegend, this.theme), d.container = void 0, d.title = a.title, d.marginLeft = c.marginLeft, d.marginRight = c.marginRight, d.verticalGap = 3, d.position = "top", e.copyProperties(this.legendSettings, d), a.addLegend(d, d.divId);
            a.zoomOutText = "";
            this.addCursor(a)
        },
        enableCursors: function(a) { var b = this.chartCursors,
                c; for (c = 0; c < b.length; c++) b[c].enabled = a },
        updatePanels: function() {
            var a = this.panels,
                b;
            for (b = 0; b < a.length; b++) this.updatePanel(a[b]);
            this.mainDataSet && this.updateGraphs();
            this.currentPeriod = void 0
        },
        updatePanel: function(a) {
            a.seriesIdField = "amCategoryIdField";
            a.dataProvider = [];
            a.chartData = [];
            a.graphs = [];
            var b = a.categoryAxis,
                c = this.categoryAxesSettings;
            e.copyProperties(this.panelsSettings, a);
            e.copyProperties(c, b);
            b.parseDates = !0;
            a.addClassNames = this.addClassNames;
            a.classNamePrefix = this.classNamePrefix;
            a.zoomOutOnDataUpdate = !1;
            void 0 !== this.mouseWheelScrollEnabled && (a.mouseWheelScrollEnabled = this.mouseWheelScrollEnabled);
            void 0 !==
                this.mouseWheelZoomEnabled && (a.mouseWheelZoomEnabled = this.mouseWheelZoomEnabled);
            a.dataDateFormat = this.dataDateFormat;
            a.language = this.language;
            a.showCategoryAxis ? "top" == b.position ? a.marginTop = c.axisHeight : a.marginBottom = c.axisHeight : (a.categoryAxis.labelsEnabled = !1, a.chartCursor && (a.chartCursor.categoryBalloonEnabled = !1));
            var c = a.valueAxes,
                d = c.length,
                k;
            0 === d && (k = new e.ValueAxis(this.theme), a.addValueAxis(k));
            b = new e.AmBalloon(this.theme);
            e.copyProperties(this.balloon, b);
            a.balloon = b;
            c = a.valueAxes;
            d = c.length;
            for (b = 0; b < d; b++) k = c[b], e.copyProperties(this.valueAxesSettings, k);
            a.listenersAdded = !1;
            a.write(a.panelBox)
        },
        zoom: function(a, b) { this.zoomChart(a, b) },
        zoomOut: function() { this.zoomChart(this.firstDate, this.lastDate) },
        updatePanelsWithNewData: function() {
            var a = this.mainDataSet,
                b = this.scrollbarChart;
            this.updateGraphs();
            if (a) {
                var c = this.panels;
                this.currentPeriod = void 0;
                var d;
                for (d = 0; d < c.length; d++) {
                    var e = c[d];
                    e.categoryField = a.categoryField;
                    0 === a.dataProvider.length && (e.dataProvider = []);
                    e.scrollbarChart =
                        b
                }
                if (b) {
                    c = this.categoryAxesSettings;
                    d = c.minPeriod;
                    b.categoryField = a.categoryField;
                    e = b.dataProvider;
                    if (0 < a.dataProvider.length) { var g = this.chartScrollbarSettings.usePeriod;
                        b.dataProvider = g ? a.agregatedDataProviders[g] : a.agregatedDataProviders[d] } else b.dataProvider = [];
                    g = b.categoryAxis;
                    g.minPeriod = d;
                    g.firstDayOfWeek = this.firstDayOfWeek;
                    g.equalSpacing = c.equalSpacing;
                    g.axisAlpha = 0;
                    g.markPeriodChange = c.markPeriodChange;
                    b.bbsetr = !0;
                    e != b.dataProvider && b.validateData();
                    c = this.panelsSettings;
                    b.maxSelectedTime =
                        c.maxSelectedTime;
                    b.minSelectedTime = c.minSelectedTime
                }
                0 < a.dataProvider.length && (this.fixGlue(), this.zoomChart(this.startDate, this.endDate))
            }
            this.panelDataInvalidated = !1
        },
        addChartScrollbar: function() {
            var a = this.chartScrollbarSettings,
                b = this.scrollbarChart;
            b && (b.clear(), b.destroy());
            if (a.enabled) {
                var c = this.panelsSettings,
                    d = this.categoryAxesSettings,
                    b = new e.AmSerialChart(this.theme);
                b.svgIcons = c.svgIcons;
                b.language = this.language;
                b.pathToImages = this.pathToImages;
                b.autoMargins = !1;
                b.addClassNames = !0;
                this.scrollbarChart =
                    b;
                b.id = "scrollbarChart";
                b.scrollbarOnly = !0;
                b.zoomOutText = "";
                c.fontFamily && (b.fontFamily = c.fontFamily);
                isNaN(c.fontSize) || (b.fontSize = c.fontSize);
                b.marginLeft = c.marginLeft;
                b.marginRight = c.marginRight;
                b.marginTop = 0;
                b.marginBottom = 0;
                var c = d.dateFormats,
                    k = b.categoryAxis;
                k.boldPeriodBeginning = d.boldPeriodBeginning;
                c && (k.dateFormats = d.dateFormats);
                k.labelsEnabled = !1;
                k.parseDates = !0;
                d = a.graph;
                if (e.isString(d)) {
                    c = this.panels;
                    for (k = 0; k < c.length; k++) { var g = e.getObjById(c[k].stockGraphs, a.graph);
                        g && (d = g) }
                    a.graph =
                        d
                }
                var m;
                d && (m = new e.AmGraph(this.theme), m.valueField = d.valueField, m.periodValue = d.periodValue, m.type = d.type, m.connect = d.connect, m.minDistance = a.minDistance, b.addGraph(m));
                d = new e.ChartScrollbar(this.theme);
                b.addChartScrollbar(d);
                e.copyProperties(a, d);
                d.scrollbarHeight = a.height;
                d.graph = m;
                this.listenTo(d, "zoomed", this.handleScrollbarZoom);
                m = document.createElement("div");
                m.className = this.classNamePrefix + "-scrollbar-chart-div";
                m.style.height = a.height + "px";
                d = this.periodSelectorContainer;
                c = this.periodSelector;
                k = this.centerContainer;
                "bottom" == a.position ? c ? "bottom" == c.position ? k.insertBefore(m, d) : k.appendChild(m) : k.appendChild(m) : c ? "top" == c.position ? k.insertBefore(m, d.nextSibling) : k.insertBefore(m, k.firstChild) : k.insertBefore(m, k.firstChild);
                b.write(m)
            }
        },
        handleScrollbarZoom: function(a) { if (this.skipScrollbarEvent) this.skipScrollbarEvent = !1;
            else { var b = a.endDate,
                    c = {};
                c.startDate = a.startDate;
                c.endDate = b;
                this.updateScrollbar = !1;
                this.handleZoom(c) } },
        addPeriodSelector: function() {
            var a = this.periodSelector;
            if (a) {
                var b =
                    this.categoryAxesSettings.minPeriod;
                a.minDuration = e.getPeriodDuration(b);
                a.minPeriod = b;
                a.chart = this;
                var c = this.dataSetSelector,
                    d, b = this.dssContainer;
                c && (d = c.position);
                var c = this.panelsSettings.panelSpacing,
                    k = document.createElement("div");
                this.periodSelectorContainer = k;
                var g = this.leftContainer,
                    m = this.rightContainer,
                    h = this.centerContainer,
                    p = this.panelsContainer,
                    f = a.width + 2 * c + "px";
                switch (a.position) {
                    case "left":
                        g.style.width = a.width + "px";
                        g.appendChild(k);
                        h.style.paddingLeft = f;
                        break;
                    case "right":
                        h.style.marginRight =
                            f;
                        m.appendChild(k);
                        m.style.width = a.width + "px";
                        break;
                    case "top":
                        p.style.clear = "both";
                        h.insertBefore(k, p);
                        k.style.paddingBottom = c + "px";
                        k.style.overflow = "hidden";
                        break;
                    case "bottom":
                        k.style.marginTop = c + "px", "bottom" == d ? h.insertBefore(k, b) : h.appendChild(k)
                }
                this.listenTo(a, "changed", this.handlePeriodSelectorZoom);
                a.write(k)
            }
        },
        addDataSetSelector: function() {
            var a = this.dataSetSelector;
            if (a) {
                a.chart = this;
                a.dataProvider = this.dataSets;
                var b = a.position,
                    c = this.panelsSettings.panelSpacing,
                    d = document.createElement("div");
                this.dssContainer = d;
                var e = this.leftContainer,
                    g = this.rightContainer,
                    m = this.centerContainer,
                    h = this.panelsContainer,
                    c = a.width + 2 * c + "px";
                switch (b) {
                    case "left":
                        e.style.width = a.width + "px";
                        e.appendChild(d);
                        m.style.paddingLeft = c; break;
                    case "right":
                        m.style.marginRight = c;
                        g.appendChild(d);
                        g.style.width = a.width + "px"; break;
                    case "top":
                        h.style.clear = "both";
                        m.insertBefore(d, h);
                        d.style.overflow = "hidden"; break;
                    case "bottom":
                        m.appendChild(d) }
                a.write(d)
            }
        },
        handlePeriodSelectorZoom: function(a) {
            var b = this.scrollbarChart;
            b && (b.updateScrollbar = !0);
            a.predefinedPeriod ? (this.predefinedStart = a.startDate, this.predefinedEnd = a.endDate) : this.predefinedEnd = this.predefinedStart = null;
            this.zoomOutValueAxes();
            this.zoomChart(a.startDate, a.endDate)
        },
        zoomOutValueAxes: function() { var a = this.panels; if (this.panelsSettings.zoomOutAxes)
                for (var b = 0; b < a.length; b++) { var c = a[b].valueAxes; if (c)
                        for (var d = 0; d < c.length; d++) { var e = c[d];
                            e.minZoom = NaN;
                            e.maxZoom = NaN } } },
        addCursor: function(a) {
            var b = this.chartCursorSettings;
            if (b.enabled) {
                var c = new e.ChartCursor(this.theme);
                e.copyProperties(b, c);
                var d = b.categoryBalloonFunction;
                a.chartCursor && (e.copyProperties(a.chartCursor, c), a.chartCursor.categoryBalloonFunction && (d = a.chartCursor.categoryBalloonFunction));
                c.categoryBalloonFunction = d;
                a.removeChartCursor();
                a.addChartCursor(c);
                "mouse" == b.cursorPosition ? this.listenTo(c, "moved", this.handleCursorChange) : this.listenTo(c, "changed", this.handleCursorChange);
                this.listenTo(c, "onHideCursor", this.handleCursorChange);
                this.listenTo(c, "zoomStarted", this.handleCursorChange);
                this.listenTo(c,
                    "zoomed", this.handleCursorZoom);
                this.chartCursors.push(c)
            }
        },
        handleCursorChange: function(a) { a = a.target; var b = this.chartCursors,
                c; for (c = 0; c < b.length; c++) { var d = b[c];
                d != a && d.syncWithCursor(a, this.chartCursorSettings.onePanelOnly) } },
        handleCursorZoom: function(a) {
            var b = this.scrollbarChart;
            b && (b.updateScrollbar = !0);
            var b = {},
                c, d;
            if (this.categoryAxesSettings.equalSpacing) { d = this.mainDataSet.categoryField; var e = this.mainDataSet.agregatedDataProviders[this.currentPeriod];
                c = new Date(e[a.start][d]);
                d = new Date(e[a.end][d]) } else c =
                new Date(a.start), d = new Date(a.end);
            b.startDate = c;
            b.endDate = d;
            this.handleZoom(b);
            this.handleCursorChange(a)
        },
        handleZoom: function(a) { this.zoomChart(a.startDate, a.endDate) },
        zoomChart: function(a, b) {
            var c = this;
            a || (a = c.firstDate);
            var d = e.newDate(a),
                k = c.firstDate,
                g = c.lastDate,
                m = c.currentPeriod,
                h = c.categoryAxesSettings,
                p = h.minPeriod,
                f = c.panelsSettings,
                l = c.periodSelector,
                n = c.panels,
                r = c.comparedGraphs,
                t = c.scrollbarChart,
                y = c.firstDayOfWeek;
            if (k && g) {
                a || (a = k);
                b || (b = g);
                if (m) {
                    var v = e.extractPeriod(m);
                    a.getTime() ==
                        b.getTime() && v != p && (b = e.changeDate(b, v.period, v.count), b.setTime(b.getTime() - 1))
                }
                a.getTime() < k.getTime() && (a = k);
                a.getTime() > g.getTime() && (a = g);
                b.getTime() < k.getTime() && (b = k);
                b.getTime() > g.getTime() && (b = g);
                p = e.getItemIndex(p, h.groupToPeriods);
                h = m;
                m = c.choosePeriod(p, a, b);
                c.currentPeriod = m;
                var p = e.extractPeriod(m),
                    A = e.getPeriodDuration(p.period, p.count);
                1 > b.getTime() - a.getTime() && (a = new Date(b.getTime() - 1));
                v = e.newDate(a);
                c.extendToFullPeriod && (v.getTime() - k.getTime() < .1 * A && (v = e.resetDateToMin(a, p.period,
                    p.count, y)), g.getTime() - b.getTime() < .1 * A && (b = e.resetDateToMin(g, p.period, p.count, y), b = e.changeDate(b, p.period, p.count, !0)));
                for (k = 0; k < n.length; k++) g = n[k], g.chartCursor && g.chartCursor.panning && (v = d);
                for (k = 0; k < n.length; k++) {
                    g = n[k];
                    d = !1;
                    if (m != h) {
                        for (d = 0; d < r.length; d++) A = r[d].graph, A.dataProvider = A.dataSet.agregatedDataProviders[m];
                        d = g.categoryAxis;
                        d.firstDayOfWeek = y;
                        d.minPeriod = m;
                        g.dataProvider = c.mainDataSet.agregatedDataProviders[m];
                        if (d = g.chartCursor) d.categoryBalloonDateFormat = c.chartCursorSettings.categoryBalloonDateFormat(p.period),
                            g.showCategoryAxis || (d.categoryBalloonEnabled = !1);
                        g.startTime = v.getTime();
                        g.endTime = b.getTime();
                        g.start = NaN;
                        g.validateData(!0);
                        d = !0
                    }
                    g.chartCursor && g.chartCursor.panning && (d = !0);
                    d || (g.startTime = void 0, g.endTime = void 0, g.zoomToDates(v, b));
                    0 < f.startDuration && c.animationPlayed && !d ? (g.startDuration = 0, g.animateAgain()) : 0 < f.startDuration && !d && g.animateAgain()
                }
                c.animationPlayed = !0;
                f = e.newDate(b);
                t && c.updateScrollbar && (t.zoomToDates(a, f), c.skipScrollbarEvent = !0, setTimeout(function() { c.resetSkip.call(c) }, 100));
                c.updateScrollbar = !0;
                c.startDate = a;
                c.endDate = b;
                l && l.zoom(a, b);
                c.skipEvents || a.getTime() == c.previousStartDate.getTime() && b.getTime() == c.previousEndDate.getTime() || (l = { type: "zoomed" }, l.startDate = a, l.endDate = b, l.chart = c, l.period = m, c.fire(l), c.previousStartDate = e.newDate(a), c.previousEndDate = e.newDate(b))
            }
            c.eventsHidden && c.showHideEvents(!1);
            c.dispDUpd()
        },
        dispDUpd: function() {
            this.skipEvents || (this.chartCreated || (this.chartCreated = !0, this.fire({ type: "init", chart: this })), this.chartRendered || (this.chartRendered = !0, this.fire({ type: "rendered", chart: this })), this.fire({ type: "drawn", chart: this }));
            this.animationPlayed = this.chartCreated = !0
        },
        resetSkip: function() { this.skipScrollbarEvent = !1 },
        updateGraphs: function() {
            this.getSelections();
            if (0 < this.dataSets.length) {
                var a = this.panels;
                this.comparedGraphs = [];
                var b;
                for (b = 0; b < a.length; b++) {
                    var c = a[b],
                        d = c.valueAxes,
                        k;
                    for (k = 0; k < d.length; k++) { var g = d[k];
                        g.prevLog && (g.logarithmic = g.prevLog);
                        g.recalculateToPercents = "always" == c.recalculateToPercents ? !0 : !1 }
                    d = this.mainDataSet;
                    k =
                        this.comparedDataSets;
                    g = c.stockGraphs;
                    c.graphs = [];
                    var m, h, p;
                    for (m = 0; m < g.length; m++) {
                        var f = g[m],
                            f = e.processObject(f, e.StockGraph, this.theme);
                        g[m] = f;
                        if (!f.title || f.resetTitleOnDataSetChange) f.title = d.title, f.resetTitleOnDataSetChange = !0;
                        f.useDataSetColors && (f.lineColor = d.color, f.fillColors = void 0, f.bulletColor = void 0);
                        var l = !1,
                            n = d.fieldMappings;
                        for (h = 0; h < n.length; h++) {
                            p = n[h];
                            var r = f.valueField;
                            r && p.toField == r && (l = !0);
                            (r = f.openField) && p.toField == r && (l = !0);
                            (r = f.closeField) && p.toField == r && (l = !0);
                            (r = f.lowField) &&
                            p.toField == r && (l = !0)
                        }
                        c.graphs.push(f);
                        c.processGraphs();
                        f.hideFromLegend = l ? !1 : !0;
                        r = !1;
                        "always" == c.recalculateToPercents && (r = !0);
                        var t = c.stockLegend,
                            y, v, A, E;
                        t && (t = e.processObject(t, e.StockLegend, this.theme), c.stockLegend = t, y = t.valueTextComparing, v = t.valueTextRegular, A = t.periodValueTextComparing, E = t.periodValueTextRegular);
                        if (f.comparable) {
                            var B = k.length;
                            if (f.valueAxis) {
                                0 < B && f.valueAxis.logarithmic && "never" != c.recalculateToPercents && (f.valueAxis.logarithmic = !1, f.valueAxis.prevLog = !0);
                                0 < B && "whenComparing" ==
                                    c.recalculateToPercents && (f.valueAxis.recalculateToPercents = !0);
                                t && f.valueAxis && !0 === f.valueAxis.recalculateToPercents && (r = !0);
                                var D;
                                for (D = 0; D < B; D++) {
                                    var C = k[D],
                                        q = f.comparedGraphs[C.id];
                                    q || (q = new e.AmGraph(this.theme), q.id = "comparedGraph_" + f.id + "_" + C.id);
                                    f.compareGraphType && (q.type = f.compareGraphType);
                                    f.compareGraph && e.copyProperties(f.compareGraph, q);
                                    q.periodValue = f.periodValue;
                                    q.recalculateValue = f.recalculateValue;
                                    q.dataSet = C;
                                    q.behindColumns = f.behindColumns;
                                    f.comparedGraphs[C.id] = q;
                                    q.seriesIdField =
                                        "amCategoryIdField";
                                    q.connect = f.connect;
                                    q.clustered = f.clustered;
                                    q.showBalloon = f.showBalloon;
                                    this.passFields(f, q);
                                    var z = f.compareField;
                                    z || (z = f.valueField);
                                    q.customBulletsHidden = !f.showEventsOnComparedGraphs;
                                    l = !1;
                                    n = C.fieldMappings;
                                    for (h = 0; h < n.length; h++) p = n[h], p.toField == z && (l = !0);
                                    if (l) {
                                        q.valueField = z;
                                        q.title = C.title ? C.title : f.title;
                                        q.lineColor = C.color;
                                        f.compareGraphLineColor && (q.lineColor = f.compareGraphLineColor);
                                        h = f.compareGraphLineThickness;
                                        isNaN(h) || (q.lineThickness = h);
                                        h = f.compareGraphDashLength;
                                        isNaN(h) || (q.dashLength = h);
                                        h = f.compareGraphLineAlpha;
                                        isNaN(h) || (q.lineAlpha = h);
                                        h = f.compareGraphCornerRadiusTop;
                                        isNaN(h) || (q.cornerRadiusTop = h);
                                        h = f.compareGraphCornerRadiusBottom;
                                        isNaN(h) || (q.cornerRadiusBottom = h);
                                        h = f.compareGraphBalloonColor;
                                        isNaN(h) || (q.balloonColor = h);
                                        h = f.compareGraphBulletColor;
                                        isNaN(h) || (q.bulletColor = h);
                                        if (h = f.compareGraphFillColors) q.fillColors = h;
                                        if (h = f.compareGraphNegativeFillColors) q.negativeFillColors = h;
                                        if (h = f.compareGraphFillAlphas) q.fillAlphas = h;
                                        if (h = f.compareGraphNegativeFillAlphas) q.negativeFillAlphas =
                                            h;
                                        if (h = f.compareGraphBullet) q.bullet = h;
                                        if (h = f.compareGraphNumberFormatter) q.numberFormatter = h;
                                        h = f.compareGraphPrecision;
                                        isNaN(h) || (q.precision = h);
                                        if (h = f.compareGraphBalloonText) q.balloonText = h;
                                        h = f.compareGraphBulletSize;
                                        isNaN(h) || (q.bulletSize = h);
                                        h = f.compareGraphBulletAlpha;
                                        isNaN(h) || (q.bulletAlpha = h);
                                        h = f.compareGraphBulletBorderAlpha;
                                        isNaN(h) || (q.bulletBorderAlpha = h);
                                        if (h = f.compareGraphBulletBorderColor) q.bulletBorderColor = h;
                                        h = f.compareGraphBulletBorderThickness;
                                        isNaN(h) || (q.bulletBorderThickness =
                                            h);
                                        q.visibleInLegend = f.compareGraphVisibleInLegend;
                                        q.balloonFunction = f.compareGraphBalloonFunction;
                                        q.hideBulletsCount = f.hideBulletsCount;
                                        q.valueAxis = f.valueAxis;
                                        t && (r && y ? (q.legendValueText = y, q.legendPeriodValueText = A) : (v && (q.legendValueText = v), q.legendPeriodValueText = E));
                                        c.showComparedOnTop ? c.graphs.push(q) : c.graphs.unshift(q);
                                        this.comparedGraphs.push({ graph: q, dataSet: C })
                                    }
                                }
                            }
                        }
                        t && (r && y ? (f.legendValueText = y, f.legendPeriodValueText = A) : (v && (f.legendValueText = v), f.legendPeriodValueText = E))
                    }
                }
            }
        },
        passFields: function(a,
            b) { for (var c = "lineColor color alpha fillColors description bullet customBullet bulletSize bulletConfig url labelColor dashLength pattern gap className".split(" "), d = 0; d < c.length; d++) { var e = c[d];
                b[e + "Field"] = a[e + "Field"] } },
        choosePeriod: function(a, b, c) {
            var d = this.categoryAxesSettings,
                k = d.groupToPeriods,
                g = k[a],
                m = k[a + 1],
                h = e.extractPeriod(g),
                h = e.getPeriodDuration(h.period, h.count),
                p = b.getTime(),
                f = c.getTime(),
                l = d.maxSeries;
            d.alwaysGroup && g == d.minPeriod && (g = 1 < k.length ? k[1] : k[0]);
            return (f - p) / h > l && 0 < l && m ?
                this.choosePeriod(a + 1, b, c) : g
        },
        getSelections: function() { var a = [],
                b = this.dataSets,
                c; for (c = 0; c < b.length; c++) { var d = b[c];
                d.compared && a.push(d) }
            this.comparedDataSets = a;
            b = this.panels; for (c = 0; c < b.length; c++) d = b[c], d.hideDrawingIcons && ("never" != d.recalculateToPercents && 0 < a.length ? d.hideDrawingIcons(!0) : d.drawingIconsEnabled && d.hideDrawingIcons(!1)) },
        addPanel: function(a) { this.panels.push(a);
            this.prevPH = void 0;
            e.removeChart(a);
            e.addChart(a) },
        addPanelAt: function(a, b) {
            this.panels.splice(b, 0, a);
            this.prevPH = void 0;
            e.removeChart(a);
            e.addChart(a)
        },
        removePanel: function(a) { var b = this.panels;
            this.prevPH = void 0; var c; for (c = b.length - 1; 0 <= c; c--) b[c] == a && (this.fire({ type: "panelRemoved", panel: a, chart: this }), b.splice(c, 1), a.destroy(), a.clear()) },
        validateData: function(a) { var b = this;
            b.validateDataTO && clearTimeout(b.validateDataTO);
            b.validateDataTO = setTimeout(function() { b.validateDataReal.call(b, a) }, 100) },
        validateDataReal: function(a) {
            a || this.resetDataParsed();
            this.updateDataSets();
            this.mainDataSet.compared = !1;
            this.updateData();
            (a = this.dataSetSelector) && a.write(a.div)
        },
        resetDataParsed: function() { var a = this.dataSets,
                b; for (b = 0; b < a.length; b++) a[b].dataParsed = !1 },
        validateNow: function(a, b) { this.skipDefault = !0;
            this.chartRendered = !1;
            this.prevPH = void 0;
            this.skipEvents = b;
            this.clear(!0);
            this.initTO && clearTimeout(this.initTO);
            a && this.resetDataParsed();
            this.write(this.div) },
        hideStockEvents: function() { this.showHideEvents(!1);
            this.eventsHidden = !0 },
        showStockEvents: function() { this.showHideEvents(!0);
            this.eventsHidden = !1 },
        showHideEvents: function(a) {
            var b =
                this.panels,
                c;
            for (c = 0; c < b.length; c++) { var d = b[c].graphs,
                    e; for (e = 0; e < d.length; e++) { var g = d[e];!0 === a ? g.showCustomBullets(!0) : g.hideCustomBullets(!0) } }
        },
        invalidateSize: function() { var a = this;
            clearTimeout(a.validateTO); var b = setTimeout(function() { a.validateNow() }, 5);
            a.validateTO = b },
        measure: function() { var a = this.div; if (a) { var b = a.offsetWidth,
                    c = a.offsetHeight;
                a.clientHeight && (b = a.clientWidth, c = a.clientHeight);
                this.divRealWidth = b;
                this.divRealHeight = c } },
        handleResize: function() {
            var a = this,
                b = setTimeout(function() { a.validateSizeReal() },
                    150);
            a.initTO = b
        },
        validateSizeReal: function() { this.previousWidth = this.divRealWidth;
            this.previousHeight = this.divRealHeight;
            this.measure(); if (this.divRealWidth != this.previousWidth || this.divRealHeight != this.previousHeight) 0 < this.divRealWidth && 0 < this.divRealHeight && this.fire({ type: "resized", chart: this }), this.divRealHeight != this.previousHeight && this.validateNow() },
        clear: function(a) {
            var b = this.panels,
                c;
            if (b)
                for (c = 0; c < b.length; c++) { var d = b[c];
                    a || (d.cleanChart(), d.destroy());
                    d.clear(a) }(b = this.scrollbarChart) &&
                b.clear();
            this.validateDataTO && clearTimeout(this.validateDataTO);
            if (b = this.div) b.innerHTML = "";
            a || (e.removeChart(this), this.div = null, e.deleteObject(this))
        }
    });
    e.StockEvent = e.Class({ construct: function() {} })
})();
(function() { var e = window.AmCharts;
    e.DataSet = e.Class({ construct: function() { this.cname = "DataSet";
            this.fieldMappings = [];
            this.dataProvider = [];
            this.agregatedDataProviders = [];
            this.stockEvents = [];
            this.compared = !1;
            this.showInCompare = this.showInSelect = !0 } }) })();
(function() {
    var e = window.AmCharts;
    e.PeriodSelector = e.Class({
        construct: function(a) { this.cname = "PeriodSelector";
            this.theme = a;
            this.createEvents("changed");
            this.inputFieldsEnabled = !0;
            this.position = "bottom";
            this.width = 180;
            this.fromText = "From: ";
            this.toText = "to: ";
            this.periodsText = "Zoom: ";
            this.periods = [];
            this.inputFieldWidth = 100;
            this.dateFormat = "DD-MM-YYYY";
            this.hideOutOfScopePeriods = !0;
            e.applyTheme(this, a, this.cname) },
        zoom: function(a, b) {
            var c = this.chart;
            this.inputFieldsEnabled && (this.startDateField.value =
                e.formatDate(a, this.dateFormat, c), this.endDateField.value = e.formatDate(b, this.dateFormat, c));
            this.markButtonAsSelected()
        },
        write: function(a) {
            var b = this,
                c = b.chart,
                d = c.classNamePrefix;
            a.className = "amChartsPeriodSelector " + d + "-period-selector-div";
            var k = b.width,
                g = b.position;
            b.width = void 0;
            b.position = void 0;
            e.applyStyles(a.style, b);
            b.width = k;
            b.position = g;
            b.div = a;
            a.innerHTML = "";
            k = b.theme;
            g = b.position;
            g = "top" == g || "bottom" == g ? !1 : !0;
            b.vertical = g;
            var m = 0,
                h = 0;
            if (b.inputFieldsEnabled) {
                var p = document.createElement("div");
                a.appendChild(p);
                var f = document.createTextNode(c.langObj.fromText || b.fromText);
                p.appendChild(f);
                g ? e.addBr(p) : (p.style.styleFloat = "left", p.style.display = "inline");
                var l = document.createElement("input");
                l.className = "amChartsInputField " + d + "-start-date-input";
                k && e.applyStyles(l.style, k.PeriodInputField);
                l.style.textAlign = "center";
                l.onblur = function(a) { b.handleCalChange(a) };
                e.isNN && l.addEventListener("keypress", function(a) { b.handleCalendarChange.call(b, a) }, !0);
                e.isIE && l.attachEvent("onkeypress", function(a) {
                    b.handleCalendarChange.call(b,
                        a)
                });
                p.appendChild(l);
                b.startDateField = l;
                if (g) f = b.width - 6 + "px", e.addBr(p);
                else { var f = b.inputFieldWidth + "px",
                        n = document.createTextNode(" ");
                    p.appendChild(n) }
                l.style.width = f;
                l = document.createTextNode(c.langObj.toText || b.toText);
                p.appendChild(l);
                g && e.addBr(p);
                l = document.createElement("input");
                l.className = "amChartsInputField " + d + "-end-date-input";
                k && e.applyStyles(l.style, k.PeriodInputField);
                l.style.textAlign = "center";
                l.onblur = function() { b.handleCalChange() };
                e.isNN && l.addEventListener("keypress", function(a) {
                    b.handleCalendarChange.call(b,
                        a)
                }, !0);
                e.isIE && l.attachEvent("onkeypress", function(a) { b.handleCalendarChange.call(b, a) });
                p.appendChild(l);
                b.endDateField = l;
                g ? e.addBr(p) : m = l.offsetHeight + 2;
                f && (l.style.width = f)
            }
            p = b.periods;
            if (e.ifArray(p)) {
                f = document.createElement("div");
                g || (f.style.cssFloat = "right", f.style.styleFloat = "right", f.style.display = "inline");
                a.appendChild(f);
                g && e.addBr(f);
                a = document.createTextNode(c.langObj.periodsText || b.periodsText);
                f.appendChild(a);
                b.periodContainer = f;
                var r;
                for (a = 0; a < p.length; a++) c = p[a], r = document.createElement("input"),
                    r.type = "button", r.value = c.label, r.period = c.period, r.count = c.count, r.periodObj = c, r.className = "amChartsButton " + d + "-period-input", k && e.applyStyles(r.style, k.PeriodButton), g && (r.style.width = b.width - 1 + "px"), r.style.boxSizing = "border-box", f.appendChild(r), b.addEventListeners(r), c.button = r;
                !g && r && (h = r.offsetHeight)
            }
            b.offsetHeight = Math.max(m, h)
        },
        addEventListeners: function(a) {
            var b = this;
            e.isNN && a.addEventListener("click", function(a) { b.handlePeriodChange.call(b, a) }, !0);
            e.isIE && a.attachEvent("onclick", function(a) {
                b.handlePeriodChange.call(b,
                    a)
            })
        },
        getPeriodDates: function() { var a = this.periods,
                b; for (b = 0; b < a.length; b++) this.selectPeriodButton(a[b], !0) },
        handleCalendarChange: function(a) { 13 == a.keyCode && this.handleCalChange(a) },
        handleCalChange: function(a) { var b = this.dateFormat,
                c = e.stringToDate(this.startDateField.value, b),
                b = this.chart.getLastDate(e.stringToDate(this.endDateField.value, b)); try { this.startDateField.blur(), this.endDateField.blur() } catch (k) {} if (c && b) { var d = { type: "changed" };
                d.startDate = c;
                d.endDate = b;
                d.chart = this.chart;
                d.event = a;
                this.fire(d) } },
        handlePeriodChange: function(a) { this.selectPeriodButton((a.srcElement ? a.srcElement : a.target).periodObj, !1, a) },
        setRanges: function(a, b) { this.firstDate = a;
            this.lastDate = b;
            this.getPeriodDates() },
        selectPeriodButton: function(a, b, c) {
            var d = a.button,
                k = d.count,
                g = d.period,
                m = this.chart,
                h, p, f = this.firstDate,
                l = this.lastDate,
                n, r = this.theme;
            h = this.selectFromStart;
            f && l && ("MAX" == g ? (h = f, p = l) : "YTD" == g ? (h = new Date, h.setMonth(0, 1), h.setHours(0, 0, 0, 0), 0 === k && h.setDate(h.getDate() - 1), p = this.lastDate) : "YYYY" == g || "MM" == g ? h ?
                (h = f, p = new Date(f), "YYYY" == g && (k *= 12), p.setMonth(p.getMonth() + k)) : (h = new Date(l), "YYYY" == g && (g = "MM", k *= 12), "MM" == g && (h = e.resetDateToMin(h, "DD")), e.changeDate(h, g, k, !1), p = l) : "fff" == g ? (e.getPeriodDuration(g, k), n = e.getPeriodDuration(g, k), h ? (h = f, p.setMilliseconds(f.getMilliseconds() - n + 1)) : (h = new Date(l.getTime()), h.setMilliseconds(h.getMilliseconds() - n + 1), p = this.lastDate)) : (n = e.getPeriodDuration(g, k), h ? (h = f, p = new Date(f.getTime() + n - 1)) : (h = new Date(l.getTime() - n + 1), p = l)), a.startTime = h.getTime(), this.hideOutOfScopePeriods &&
                (b && a.startTime < f.getTime() ? d.style.display = "none" : d.style.display = "inline"), h.getTime() > l.getTime() && (n = e.getPeriodDuration("DD", 1), h = new Date(l.getTime() - n)), h.getTime() < f.getTime() && (h = f), "YTD" == g && (a.startTime = h.getTime(), l.getFullYear() < (new Date).getFullYear() && (d.style.display = "none")), a.endTime = p.getTime(), b || (this.skipMark = !0, this.unselectButtons(), d.className = "amChartsButtonSelected " + m.classNamePrefix + "-period-input-selected", r && e.applyStyles(d.style, r.PeriodButtonSelected), a = { type: "changed" },
                    a.startDate = h, a.endDate = p, a.predefinedPeriod = g, a.chart = this.chart, a.count = k, a.event = c, this.fire(a)))
        },
        markButtonAsSelected: function() {
            if (!this.skipMark) {
                var a = this.chart,
                    b = this.periods,
                    c = a.startDate.getTime(),
                    d = a.endDate.getTime(),
                    k = this.lastDate.getTime();
                d > k && (d = k);
                k = this.theme;
                this.unselectButtons();
                var g;
                for (g = b.length - 1; 0 <= g; g--) {
                    var m = b[g],
                        h = m.button;
                    m.startTime && m.endTime && c == m.startTime && d == m.endTime && (this.unselectButtons(), h.className = "amChartsButtonSelected " + a.classNamePrefix + "-period-input-selected",
                        k && e.applyStyles(h.style, k.PeriodButtonSelected))
                }
            }
            this.skipMark = !1
        },
        unselectButtons: function() { var a = this.chart,
                b = this.periods,
                c, d = this.theme; for (c = b.length - 1; 0 <= c; c--) { var k = b[c].button;
                k.className = "amChartsButton " + a.classNamePrefix + "-period-input";
                d && e.applyStyles(k.style, d.PeriodButton) } },
        setDefaultPeriod: function() { var a = this.periods,
                b; if (this.chart.chartCreated)
                for (b = 0; b < a.length; b++) { var c = a[b];
                    c.selected && this.selectPeriodButton(c) } }
    })
})();
(function() { var e = window.AmCharts;
    e.StockGraph = e.Class({ inherits: e.AmGraph, construct: function(a) { e.StockGraph.base.construct.call(this, a);
            this.cname = "StockGraph";
            this.useDataSetColors = !0;
            this.periodValue = "Close";
            this.compareGraphType = "line";
            this.compareGraphVisibleInLegend = !0;
            this.comparable = this.resetTitleOnDataSetChange = !1;
            this.comparedGraphs = {};
            this.showEventsOnComparedGraphs = !1;
            e.applyTheme(this, a, this.cname) } }) })();
(function() {
    var e = window.AmCharts;
    e.StockPanel = e.Class({
        inherits: e.AmSerialChart,
        construct: function(a) {
            e.StockPanel.base.construct.call(this, a);
            this.cname = "StockPanel";
            this.theme = a;
            this.showCategoryAxis = this.showComparedOnTop = !0;
            this.recalculateToPercents = "whenComparing";
            this.panelHeaderPaddingBottom = this.panelHeaderPaddingLeft = this.panelHeaderPaddingRight = this.panelHeaderPaddingTop = 0;
            this.trendLineAlpha = 1;
            this.trendLineColor = "#00CC00";
            this.trendLineColorHover = "#CC0000";
            this.trendLineThickness = 2;
            this.trendLineDashLength = 0;
            this.stockGraphs = [];
            this.drawingIconsEnabled = !1;
            this.iconSize = 38;
            this.autoMargins = this.allowTurningOff = this.eraseAll = this.erasingEnabled = this.drawingEnabled = !1;
            e.applyTheme(this, a, this.cname)
        },
        initChart: function(a) { e.StockPanel.base.initChart.call(this, a);
            this.drawingIconsEnabled && this.createDrawIcons();
            (a = this.chartCursor) && this.listenTo(a, "draw", this.handleDraw) },
        addStockGraph: function(a) { this.stockGraphs.push(a); return a },
        handleCursorZoom: function(a) {
            a.start = NaN;
            a.end =
                NaN;
            e.StockPanel.base.handleCursorZoom.call(this, a)
        },
        removeStockGraph: function(a) { var b = this.stockGraphs,
                c; for (c = b.length - 1; 0 <= c; c--) b[c] == a && b.splice(c, 1) },
        createDrawIcons: function() {
            var a = this,
                b = a.iconSize,
                c = a.container,
                d = a.pathToImages,
                k = a.realWidth - 2 * b - 1 - a.marginRight,
                g = e.rect(c, b, b, "#000", .005),
                m = e.rect(c, b, b, "#000", .005);
            m.translate(b + 1, 0);
            var h = c.image(d + "pencilIcon" + a.extension, 0, 0, b, b);
            e.setCN(a, h, "pencil");
            a.pencilButton = h;
            m.setAttr("cursor", "pointer");
            g.setAttr("cursor", "pointer");
            g.mouseup(function() { a.handlePencilClick() });
            var p = c.image(d + "pencilIconH" + a.extension, 0, 0, b, b);
            e.setCN(a, p, "pencil-pushed");
            a.pencilButtonPushed = p;
            a.drawingEnabled || p.hide();
            var f = c.image(d + "eraserIcon" + a.extension, b + 1, 0, b, b);
            e.setCN(a, f, "eraser");
            a.eraserButton = f;
            m.mouseup(function() { a.handleEraserClick() });
            g.touchend && (g.touchend(function() { a.handlePencilClick() }), m.touchend(function() { a.handleEraserClick() }));
            b = c.image(d + "eraserIconH" + a.extension, b + 1, 0, b, b);
            e.setCN(a, b, "eraser-pushed");
            a.eraserButtonPushed = b;
            a.erasingEnabled || b.hide();
            c =
                c.set([h, p, f, b, g, m]);
            e.setCN(a, c, "drawing-tools");
            c.translate(k, 1);
            this.hideIcons && c.hide()
        },
        handlePencilClick: function() { var a = !this.drawingEnabled;
            this.disableDrawing(!a);
            this.erasingEnabled = !1; var b = this.eraserButtonPushed;
            b && b.hide();
            b = this.pencilButtonPushed;
            a ? b && b.show() : (b && b.hide(), this.setMouseCursor("auto")) },
        disableDrawing: function(a) { this.drawingEnabled = !a; var b = this.chartCursor;
            this.stockChart && (this.stockChart.enableCursors(a), b && b.enableDrawing(!a)) },
        handleEraserClick: function() {
            this.disableDrawing(!0);
            var a = this.pencilButtonPushed;
            a && a.hide();
            a = this.eraserButtonPushed;
            if (this.eraseAll) { var a = this.trendLines,
                    b; for (b = a.length - 1; 0 <= b; b--) { var c = a[b];
                    c.isProtected || this.removeTrendLine(c) }
                this.validateNow() } else(this.erasingEnabled = b = !this.erasingEnabled) ? (a && a.show(), this.setTrendColorHover(this.trendLineColorHover), this.setMouseCursor("auto")) : (a && a.hide(), this.setTrendColorHover())
        },
        setTrendColorHover: function(a) {
            var b = this.trendLines,
                c;
            for (c = b.length - 1; 0 <= c; c--) {
                var d = b[c];
                d.isProtected || (d.rollOverColor =
                    a);
                this.listenTo(d, "click", this.handleTrendClick)
            }
        },
        handleDraw: function(a) {
            var b = this.drawOnAxis;
            e.isString(b) && (b = this.getValueAxisById(b));
            b || (b = this.valueAxes[0]);
            this.drawOnAxis = b;
            var c = this.categoryAxis,
                d = a.initialX,
                k = a.finalX,
                g = a.initialY;
            a = a.finalY;
            var m = new e.TrendLine(this.theme);
            m.initialDate = c.coordinateToDate(d);
            m.finalDate = c.coordinateToDate(k);
            m.initialValue = b.coordinateToValue(g);
            m.finalValue = b.coordinateToValue(a);
            m.lineAlpha = this.trendLineAlpha;
            m.lineColor = this.trendLineColor;
            m.lineThickness =
                this.trendLineThickness;
            m.dashLength = this.trendLineDashLength;
            m.valueAxis = b;
            m.categoryAxis = c;
            this.addTrendLine(m);
            this.listenTo(m, "click", this.handleTrendClick);
            this.validateNow()
        },
        hideDrawingIcons: function(a) {
            (this.hideIcons = a) && this.disableDrawing(a) },
        handleTrendClick: function(a) { this.erasingEnabled && (a = a.trendLine, this.eraseAll || a.isProtected || this.removeTrendLine(a), this.validateNow()) },
        handleWheelReal: function(a, b) {
            var c = this.scrollbarChart;
            if (!this.wheelBusy && c) {
                var d = 1;
                this.mouseWheelZoomEnabled ?
                    b || (d = -1) : b && (d = -1);
                var c = c.chartScrollbar,
                    e = this.categoryAxis.minDuration();
                0 > a ? (d = this.startTime + d * e, e = this.endTime + 1 * e) : (d = this.startTime - d * e, e = this.endTime - 1 * e);
                d < this.firstTime && (d = this.firstTime);
                e > this.lastTime && (e = this.lastTime);
                d < e && c.timeZoom(d, e, !0)
            }
        }
    })
})();
(function() { var e = window.AmCharts;
    e.CategoryAxesSettings = e.Class({ construct: function(a) { this.cname = "CategoryAxesSettings";
            this.minPeriod = "DD";
            this.equalSpacing = !1;
            this.axisHeight = 28;
            this.tickLength = this.axisAlpha = 0;
            this.gridCount = 10;
            this.maxSeries = 150;
            this.groupToPeriods = "ss 10ss 30ss mm 10mm 30mm hh DD WW MM YYYY".split(" ");
            this.markPeriodChange = this.autoGridCount = !0;
            e.applyTheme(this, a, this.cname) } }) })();
(function() {
    var e = window.AmCharts;
    e.ChartCursorSettings = e.Class({
        construct: function(a) {
            this.cname = "ChartCursorSettings";
            this.enabled = !0;
            this.bulletsEnabled = this.valueBalloonsEnabled = !1;
            this.graphBulletSize = 1;
            this.onePanelOnly = !1;
            this.categoryBalloonDateFormats = [{ period: "YYYY", format: "YYYY" }, { period: "MM", format: "MMM, YYYY" }, { period: "WW", format: "MMM DD, YYYY" }, { period: "DD", format: "MMM DD, YYYY" }, { period: "hh", format: "JJ:NN" }, { period: "mm", format: "JJ:NN" }, { period: "ss", format: "JJ:NN:SS" }, {
                period: "fff",
                format: "JJ:NN:SS"
            }];
            e.applyTheme(this, a, this.cname)
        },
        categoryBalloonDateFormat: function(a) { var b = this.categoryBalloonDateFormats,
                c, d; for (d = 0; d < b.length; d++) b[d].period == a && (c = b[d].format); return c }
    })
})();
(function() { var e = window.AmCharts;
    e.ChartScrollbarSettings = e.Class({ construct: function(a) { this.cname = "ChartScrollbarSettings";
            this.height = 40;
            this.enabled = !0;
            this.color = "#FFFFFF";
            this.updateOnReleaseOnly = this.autoGridCount = !0;
            this.hideResizeGrips = !1;
            this.position = "bottom";
            this.minDistance = 1;
            e.applyTheme(this, a, this.cname) } }) })();
(function() { var e = window.AmCharts;
    e.LegendSettings = e.Class({ construct: function(a) { this.cname = "LegendSettings";
            this.marginBottom = this.marginTop = 0;
            this.usePositiveNegativeOnPercentsOnly = !0;
            this.positiveValueColor = "#00CC00";
            this.negativeValueColor = "#CC0000";
            this.autoMargins = this.equalWidths = this.textClickEnabled = !1;
            e.applyTheme(this, a, this.cname) } }) })();
(function() { var e = window.AmCharts;
    e.PanelsSettings = e.Class({ construct: function(a) { this.cname = "PanelsSettings";
            this.marginBottom = this.marginTop = this.marginRight = this.marginLeft = 0;
            this.backgroundColor = "#FFFFFF";
            this.backgroundAlpha = 0;
            this.panelSpacing = 8;
            this.panEventsEnabled = !0;
            this.creditsPosition = "top-right";
            this.svgIcons = this.zoomOutAxes = !0;
            e.applyTheme(this, a, this.cname) } }) })();
(function() { var e = window.AmCharts;
    e.StockEventsSettings = e.Class({ construct: function(a) { this.cname = "StockEventsSettings";
            this.type = "sign";
            this.backgroundAlpha = 1;
            this.backgroundColor = "#DADADA";
            this.borderAlpha = 1;
            this.borderColor = "#888888";
            this.balloonColor = this.rollOverColor = "#CC0000";
            e.applyTheme(this, a, this.cname) } }) })();
(function() { var e = window.AmCharts;
    e.ValueAxesSettings = e.Class({ construct: function(a) { this.cname = "ValueAxesSettings";
            this.tickLength = 0;
            this.showFirstLabel = this.autoGridCount = this.inside = !0;
            this.showLastLabel = !1;
            this.axisAlpha = 0;
            e.applyTheme(this, a, this.cname) } }) })();
(function() { var e = window.AmCharts;
    e.getItemIndex = function(a, b) { var c = -1,
            d; for (d = 0; d < b.length; d++) a == b[d] && (c = d); return c };
    e.addBr = function(a) { a.appendChild(document.createElement("br")) };
    e.applyStyles = function(a, b) { if (b && a)
            for (var c in a) { var d = c,
                    e = b[d]; if (void 0 !== e) try { a[d] = e } catch (g) {} } } })();
(function() {
    var e = window.AmCharts;
    e.StockLegend = e.Class({
        inherits: e.AmLegend,
        construct: function(a) { e.StockLegend.base.construct.call(this, a);
            this.cname = "StockLegend";
            this.valueTextComparing = "[[percents.value]]%";
            this.valueTextRegular = "[[value]]";
            e.applyTheme(this, a, this.cname) },
        drawLegend: function() {
            var a = this;
            e.StockLegend.base.drawLegend.call(a);
            var b = a.chart;
            if (b.allowTurningOff) {
                var c = a.container,
                    d = c.image(b.pathToImages + "xIcon" + b.extension, b.realWidth - 19, 3, 19, 19),
                    b = c.image(b.pathToImages + "xIconH" +
                        b.extension, b.realWidth - 19, 3, 19, 19);
                b.hide();
                a.xButtonHover = b;
                d.mouseup(function() { a.handleXClick() }).mouseover(function() { a.handleXOver() });
                b.mouseup(function() { a.handleXClick() }).mouseout(function() { a.handleXOut() })
            }
        },
        handleXOver: function() { this.xButtonHover.show() },
        handleXOut: function() { this.xButtonHover.hide() },
        handleXClick: function() { var a = this.chart,
                b = a.stockChart;
            b.removePanel(a);
            b.validateNow() }
    })
})();
(function() {
    var e = window.AmCharts;
    e.DataSetSelector = e.Class({
        construct: function(a) { this.cname = "DataSetSelector";
            this.theme = a;
            this.createEvents("dataSetSelected", "dataSetCompared", "dataSetUncompared");
            this.position = "left";
            this.selectText = "Select:";
            this.comboBoxSelectText = "Select...";
            this.compareText = "Compare to:";
            this.width = 180;
            this.dataProvider = [];
            this.listHeight = 150;
            this.listCheckBoxSize = 14;
            this.rollOverBackgroundColor = "#b2e1ff";
            this.selectedBackgroundColor = "#7fceff";
            e.applyTheme(this, a, this.cname) },
        write: function(a) {
            var b = this,
                c, d = b.theme,
                k = b.chart;
            a.className = "amChartsDataSetSelector " + k.classNamePrefix + "-data-set-selector-div";
            var g = b.width;
            c = b.position;
            b.width = void 0;
            b.position = void 0;
            e.applyStyles(a.style, b);
            b.div = a;
            b.width = g;
            b.position = c;
            a.innerHTML = "";
            var g = b.position,
                m;
            m = "top" == g || "bottom" == g ? !1 : !0;
            b.vertical = m;
            var h;
            m && (h = b.width + "px");
            var g = b.dataProvider,
                p, f;
            if (1 < b.countDataSets("showInSelect")) {
                c = document.createTextNode(k.langObj.selectText || b.selectText);
                a.appendChild(c);
                m && e.addBr(a);
                var l = document.createElement("select");
                h && (l.style.width = h);
                b.selectCB = l;
                d && e.applyStyles(l.style, d.DataSetSelect);
                l.className = k.classNamePrefix + "-data-set-select";
                a.appendChild(l);
                e.isNN && l.addEventListener("change", function(a) { b.handleDataSetChange.call(b, a) }, !0);
                e.isIE && l.attachEvent("onchange", function(a) { b.handleDataSetChange.call(b, a) });
                for (c = 0; c < g.length; c++)
                    if (p = g[c], !0 === p.showInSelect) {
                        f = document.createElement("option");
                        f.className = k.classNamePrefix + "-data-set-select-option";
                        f.text = p.title;
                        f.value = c;
                        p == b.chart.mainDataSet && (f.selected = !0);
                        try { l.add(f, null) } catch (n) { l.add(f) }
                    }
                b.offsetHeight = l.offsetHeight
            }
            if (0 < b.countDataSets("showInCompare") && 1 < g.length)
                if (m ? (e.addBr(a), e.addBr(a)) : (c = document.createTextNode(" "), a.appendChild(c)), c = document.createTextNode(k.langObj.compareText || b.compareText), a.appendChild(c), f = b.listCheckBoxSize, m) {
                    e.addBr(a);
                    h = document.createElement("div");
                    a.appendChild(h);
                    h.className = "amChartsCompareList " + k.classNamePrefix + "-compare-div";
                    d && e.applyStyles(h.style,
                        d.DataSetCompareList);
                    h.style.overflow = "auto";
                    h.style.overflowX = "hidden";
                    h.style.width = b.width - 2 + "px";
                    h.style.maxHeight = b.listHeight + "px";
                    for (c = 0; c < g.length; c++) p = g[c], !0 === p.showInCompare && p != b.chart.mainDataSet && (d = document.createElement("div"), d.style.padding = "4px", d.style.position = "relative", d.name = "amCBContainer", d.className = k.classNamePrefix + "-compare-item-div", d.dataSet = p, d.style.height = f + "px", p.compared && (d.style.backgroundColor = b.selectedBackgroundColor), h.appendChild(d), m = document.createElement("div"),
                        m.style.width = f + "px", m.style.height = f + "px", m.style.position = "absolute", m.style.backgroundColor = p.color, d.appendChild(m), m = document.createElement("div"), m.style.width = "100%", m.style.position = "absolute", m.style.left = f + 10 + "px", d.appendChild(m), p = document.createTextNode(p.title), m.style.whiteSpace = "nowrap", m.style.cursor = "default", m.appendChild(p), b.addEventListeners(d));
                    e.addBr(a);
                    e.addBr(a)
                } else {
                    d = document.createElement("select");
                    b.compareCB = d;
                    h && (d.style.width = h);
                    a.appendChild(d);
                    e.isNN && d.addEventListener("change",
                        function(a) { b.handleCBSelect.call(b, a) }, !0);
                    e.isIE && d.attachEvent("onchange", function(a) { b.handleCBSelect.call(b, a) });
                    f = document.createElement("option");
                    f.text = k.langObj.comboBoxSelectText || b.comboBoxSelectText;
                    try { d.add(f, null) } catch (n) { d.add(f) }
                    for (c = 0; c < g.length; c++)
                        if (p = g[c], !0 === p.showInCompare && p != b.chart.mainDataSet) { f = document.createElement("option");
                            f.text = p.title;
                            f.value = c;
                            p.compared && (f.selected = !0); try { d.add(f, null) } catch (n) { d.add(f) } }
                    b.offsetHeight = d.offsetHeight
                }
        },
        addEventListeners: function(a) {
            var b =
                this;
            e.isNN && (a.addEventListener("mouseover", function(a) { b.handleRollOver.call(b, a) }, !0), a.addEventListener("mouseout", function(a) { b.handleRollOut.call(b, a) }, !0), a.addEventListener("click", function(a) { b.handleClick.call(b, a) }, !0));
            e.isIE && (a.attachEvent("onmouseout", function(a) { b.handleRollOut.call(b, a) }), a.attachEvent("onmouseover", function(a) { b.handleRollOver.call(b, a) }), a.attachEvent("onclick", function(a) { b.handleClick.call(b, a) }))
        },
        handleDataSetChange: function() {
            var a = this.selectCB,
                a = this.dataProvider[a.options[a.selectedIndex].value],
                b = this.chart;
            b.mainDataSet = a;
            b.zoomOutOnDataSetChange && (b.startDate = void 0, b.endDate = void 0);
            b.validateData(!0);
            this.fire({ type: "dataSetSelected", dataSet: a, chart: this.chart })
        },
        handleRollOver: function(a) { a = this.getRealDiv(a);
            a.dataSet.compared || (a.style.backgroundColor = this.rollOverBackgroundColor) },
        handleRollOut: function(a) { a = this.getRealDiv(a);
            a.dataSet.compared || (a.style.removeProperty && a.style.removeProperty("background-color"), a.style.removeAttribute && a.style.removeAttribute("backgroundColor")) },
        handleCBSelect: function(a) { var b = this.compareCB,
                c = this.dataProvider,
                d, e; for (d = 0; d < c.length; d++) e = c[d], e.compared && (a = { type: "dataSetUncompared", dataSet: e }), e.compared = !1;
            c = b.selectedIndex;
            0 < c && (e = this.dataProvider[b.options[c].value], e.compared || (a = { type: "dataSetCompared", dataSet: e }), e.compared = !0);
            b = this.chart;
            b.validateData(!0);
            a.chart = b;
            this.fire(a) },
        handleClick: function(a) {
            a = this.getRealDiv(a).dataSet;
            !0 === a.compared ? (a.compared = !1, a = { type: "dataSetUncompared", dataSet: a }) : (a.compared = !0, a = {
                type: "dataSetCompared",
                dataSet: a
            });
            var b = this.chart;
            b.validateData(!0);
            a.chart = b;
            this.fire(a)
        },
        getRealDiv: function(a) { a || (a = window.event);
            a = a.currentTarget ? a.currentTarget : a.srcElement; "amCBContainer" == a.parentNode.name && (a = a.parentNode); return a },
        countDataSets: function(a) { var b = this.dataProvider,
                c = 0,
                d; for (d = 0; d < b.length; d++) !0 === b[d][a] && c++; return c }
    })
})();
(function() {
    var e = window.AmCharts;
    e.StackedBullet = e.Class({
        construct: function() { this.stackDown = !1;
            this.mastHeight = 8;
            this.shapes = [];
            this.backgroundColors = [];
            this.backgroundAlphas = [];
            this.borderAlphas = [];
            this.borderColors = [];
            this.colors = [];
            this.rollOverColors = [];
            this.showOnAxiss = [];
            this.values = [];
            this.showAts = [];
            this.textColor = "#000000";
            this.nextY = 0;
            this.size = 16 },
        parseConfig: function() {
            var a = this.bulletConfig;
            this.eventObjects = a.eventObjects;
            this.letters = a.letters;
            this.shapes = a.shapes;
            this.backgroundColors =
                a.backgroundColors;
            this.backgroundAlphas = a.backgroundAlphas;
            this.borderColors = a.borderColors;
            this.borderAlphas = a.borderAlphas;
            this.colors = a.colors;
            this.rollOverColors = a.rollOverColors;
            this.date = a.date;
            this.showOnAxiss = a.showOnAxis;
            this.axisCoordinate = a.minCoord;
            this.showAts = a.showAts;
            this.values = a.values;
            this.fontSizes = a.fontSizes;
            this.showBullets = a.showBullets
        },
        write: function(a) {
            this.parseConfig();
            this.container = a;
            this.bullets = [];
            this.fontSize = this.chart.fontSize;
            if (this.graph) {
                var b = this.graph.fontSize;
                b && (this.fontSize = b)
            }
            b = this.letters.length;
            (this.mastHeight + 2 * (this.fontSize / 2 + 2)) * b > this.availableSpace && (this.stackDown = !0);
            this.set = a.set();
            this.cset = a.set();
            this.set.push(this.cset);
            this.set.doNotScale = !0;
            a = 0;
            var c;
            for (c = 0; c < b; c++) {
                this.shape = this.shapes[c];
                this.backgroundColor = this.backgroundColors[c];
                this.backgroundAlpha = this.backgroundAlphas[c];
                this.borderAlpha = this.borderAlphas[c];
                this.borderColor = this.borderColors[c];
                this.rollOverColor = this.rollOverColors[c];
                this.showOnAxis = this.showOnAxiss[c];
                this.showBullet = this.showBullets[c];
                this.color = this.colors[c];
                this.value = this.values[c];
                this.showAt = this.showAts[c];
                var d = this.fontSizes[c];
                isNaN(d) || (this.fontSize = d);
                this.addLetter(this.letters[c], a, c);
                this.showOnAxis || a++
            }
        },
        addLetter: function(a, b, c) {
            var d = this.container;
            b = d.set();
            var k = -1,
                g = this.stackDown,
                m = this.graph.valueAxis;
            this.showOnAxis && (this.stackDown = m.reversed ? !0 : !1);
            this.stackDown && (k = 1);
            var h = 0,
                p = 0,
                f = 0,
                l, n = this.fontSize,
                r = this.mastHeight,
                t = this.shape,
                y = this.textColor;
            void 0 !== this.color &&
                (y = this.color);
            void 0 === a && (a = "");
            a = e.fixBrakes(a);
            a = e.text(d, a, y, this.chart.fontFamily, this.fontSize);
            a.node.style.pointerEvents = "none";
            d = a.getBBox();
            this.labelWidth = y = d.width;
            this.labelHeight = d.height;
            var v, d = 0;
            switch (t) {
                case "sign":
                    v = this.drawSign(b);
                    h = r + 4 + n / 2;
                    d = r + n + 4;
                    1 == k && (h -= 4);
                    break;
                case "flag":
                    v = this.drawFlag(b);
                    p = y / 2 + 3;
                    h = r + 4 + n / 2;
                    d = r + n + 4;
                    1 == k && (h -= 4);
                    break;
                case "pin":
                    v = this.drawPin(b);
                    h = 6 + n / 2;
                    d = n + 8;
                    break;
                case "triangleUp":
                    v = this.drawTriangleUp(b);
                    h = -n - 1;
                    d = n + 4;
                    k = -1;
                    break;
                case "triangleDown":
                    v =
                        this.drawTriangleDown(b);
                    h = n + 1;
                    d = n + 4;
                    k = -1;
                    break;
                case "triangleLeft":
                    v = this.drawTriangleLeft(b);
                    p = n;
                    d = n + 4;
                    k = -1;
                    break;
                case "triangleRight":
                    v = this.drawTriangleRight(b);
                    p = -n;
                    k = -1;
                    d = n + 4;
                    break;
                case "arrowUp":
                    v = this.drawArrowUp(b);
                    a.hide();
                    break;
                case "arrowDown":
                    v = this.drawArrowDown(b);
                    a.hide();
                    d = n + 4;
                    break;
                case "text":
                    k = -1;
                    v = this.drawTextBackground(b, a);
                    h = this.labelHeight + 3;
                    d = n + 10;
                    break;
                case "round":
                    v = this.drawCircle(b)
            }
            this.bullets[c] = v;
            this.showOnAxis ? (l = isNaN(this.nextAxisY) ? this.axisCoordinate : this.nextY,
                f = h * k, this.nextAxisY = l + k * d) : this.value ? (l = this.value, m.recalculateToPercents && (l = l / m.recBaseValue * 100 - 100), l = m.getCoordinate(l) - this.bulletY, f = h * k) : this.showAt ? (v = this.graphDataItem.values, m.recalculateToPercents && (v = this.graphDataItem.percents), v && (l = m.getCoordinate(v[this.showAt]) - this.bulletY, f = h * k)) : (l = this.nextY, f = h * k);
            a.translate(p, f);
            b.push(a);
            b.translate(0, l);
            this.addEventListeners(b, c);
            this.nextY = l + k * d;
            this.stackDown = g
        },
        addEventListeners: function(a, b) {
            var c = this;
            a.click(function() { c.handleClick(b) }).mouseover(function() { c.handleMouseOver(b) }).touchend(function() {
                c.handleMouseOver(b, !0);
                c.handleClick(b);
                setTimeout(function() { c.handleMouseOut.call(c, b) }, 200)
            }).mouseout(function() { c.handleMouseOut(b) }).touchstart(function() { c.handleMouseOver(b) })
        },
        drawPin: function(a) { var b = -1;
            this.stackDown && (b = 1); var c = this.fontSize + 4; return this.drawRealPolygon(a, [0, c / 2, c / 2, -c / 2, -c / 2, 0], [0, b * c / 4, b * (c + c / 4), b * (c + c / 4), b * c / 4, 0]) },
        drawSign: function(a) {
            var b = -1;
            this.stackDown && (b = 1);
            var c = this.mastHeight * b,
                d = this.fontSize / 2 + 2,
                k = e.line(this.container, [0, 0], [0, c], this.borderColor, this.borderAlpha, 1),
                g = e.circle(this.container, d, this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            g.translate(0, c + d * b);
            a.push(k);
            a.push(g);
            this.cset.push(a);
            return g
        },
        drawFlag: function(a) {
            var b = -1;
            this.stackDown && (b = 1);
            var c = this.fontSize + 4,
                d = this.labelWidth + 6,
                k = this.mastHeight,
                b = 1 == b ? b * k : b * k - c,
                k = e.line(this.container, [0, 0], [0, b], this.borderColor, this.borderAlpha, 1),
                c = e.polygon(this.container, [0, d, d, 0], [0, 0, c, c], this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            c.translate(0, b);
            a.push(k);
            a.push(c);
            this.cset.push(a);
            return c
        },
        drawTriangleUp: function(a) { var b = this.fontSize + 7; return this.drawRealPolygon(a, [0, b / 2, -b / 2, 0], [0, b, b, 0]) },
        drawArrowUp: function(a) { var b = this.size,
                c = b / 2,
                d = b / 4; return this.drawRealPolygon(a, [0, c, d, d, -d, -d, -c, 0], [0, c, c, b, b, c, c, 0]) },
        drawArrowDown: function(a) { var b = this.size,
                c = b / 2,
                d = b / 4; return this.drawRealPolygon(a, [0, c, d, d, -d, -d, -c, 0], [0, -c, -c, -b, -b, -c, -c, 0]) },
        drawTriangleDown: function(a) {
            var b = this.fontSize + 7;
            return this.drawRealPolygon(a, [0, b / 2, -b / 2, 0], [0, -b, -b, 0])
        },
        drawTriangleLeft: function(a) { var b = this.fontSize + 7; return this.drawRealPolygon(a, [0, b, b, 0], [0, -b / 2, b / 2, 0]) },
        drawTriangleRight: function(a) { var b = this.fontSize + 7; return this.drawRealPolygon(a, [0, -b, -b, 0], [0, -b / 2, b / 2, 0]) },
        drawRealPolygon: function(a, b, c) { b = e.polygon(this.container, b, c, this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            a.push(b);
            this.cset.push(a); return b },
        drawCircle: function(a) {
            var b = e.circle(this.container, this.fontSize / 2, this.backgroundColor,
                this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            a.push(b);
            this.cset.push(a);
            return b
        },
        drawTextBackground: function(a, b) { var c = b.getBBox(),
                d = -c.width / 2 - 5,
                e = c.width / 2 + 5,
                c = -c.height - 12; return this.drawRealPolygon(a, [d, -5, 0, 5, e, e, d, d], [-5, -5, 0, -5, -5, c, c, -5]) },
        handleMouseOver: function(a, b) {
            b || this.bullets[a].attr({ fill: this.rollOverColors[a] });
            var c = this.eventObjects[a],
                d = { type: "rollOverStockEvent", eventObject: c, graph: this.graph, date: this.date },
                k = this.bulletConfig.eventDispatcher;
            d.chart = k;
            k.fire(d);
            c.url && this.bullets[a].setAttr("cursor", "pointer");
            d = this.chart;
            d.showBalloon(e.fixNewLines(c.description), k.stockEventsSettings.balloonColor, !0);
            c = d.graphs;
            for (k = 0; k < c.length; k++) c[k].hideBalloon()
        },
        handleClick: function(a) { a = this.eventObjects[a]; var b = { type: "clickStockEvent", eventObject: a, graph: this.graph, date: this.date },
                c = this.bulletConfig.eventDispatcher;
            b.chart = c;
            c.fire(b);
            b = a.urlTarget;
            b || (b = c.stockEventsSettings.urlTarget);
            e.getURL(a.url, b) },
        handleMouseOut: function(a) {
            this.bullets[a].attr({ fill: this.backgroundColors[a] });
            a = { type: "rollOutStockEvent", eventObject: this.eventObjects[a], graph: this.graph, date: this.date };
            var b = this.bulletConfig.eventDispatcher;
            a.chart = b;
            this.chart.hideBalloonReal();
            b.fire(a)
        }
    })
})();