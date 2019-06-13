sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History"
	], function (BaseController, MessageBox, Utilities, History) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.llMd.controller.DetailPage1", {
			handleRouteMatched: function (oEvent) {
				var sAppId = "App5cfe0bb752e93a3710524b07";
				var oParams = {};
				if (sap.ui.Device.system.desktop) {
					this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
					this._oRootView.getController().setMode(sap.m.SplitAppMode.StretchCompressMode);
				} else {
					this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
					this._oRootView.getController().setMode(sap.m.SplitAppMode.StretchCompressMode);
				}
				if (oEvent.mParameters.data.context) {
					this.sContext = oEvent.mParameters.data.context;
				} else {
					if (this.getOwnerComponent().getComponentData()) {
						var patternConvert = function (oParam) {
							if (Object.keys(oParam).length !== 0) {
								for (var prop in oParam) {
									if (prop !== "sourcePrototype" && prop.includes("Set")) {
										return prop + "(" + oParam[prop][0] + ")";
									}
								}
							}
						};
						this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
					}
				}
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			},
			_onButtonPress: function (oEvent) {
				
				var oItem, oCtx;
				oItem = oEvent.getSource();
				oCtx = oItem.getBindingContext();
				this.getOwnerComponent().getRouter().navTo("DetailPage2_binded", {
					CategoryID: oCtx.getProperty("CategoryID")
				});
				
				/*var oBindingContext = oEvent.getSource().getBindingContext();
				return new Promise(function (fnResolve) {
					this.doNavigate("DetailPage2", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});*/
			},
			doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
				var sPath = oBindingContext ? oBindingContext.getPath() : null;
				var oModel = oBindingContext ? oBindingContext.getModel() : null;
				var sEntityNameSet;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						sPath = sPath.substring(1);
					}
					sEntityNameSet = sPath.split("(")[0];
				}
				var sNavigationPropertyName;
				var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;
				if (sEntityNameSet !== null) {
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
						sRouteName);
				}
				if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
					if (sNavigationPropertyName === "") {
						this.oRouter.navTo(sRouteName, {
							context: sPath,
							masterContext: sMasterContext
						}, false);
					} else {
						oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
							if (bindingContext) {
								sPath = bindingContext.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}
							// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
							if (sPath === "undefined") {
								this.oRouter.navTo(sRouteName);
							} else {
								this.oRouter.navTo(sRouteName, {
									context: sPath,
									masterContext: sMasterContext
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sRouteName);
				}
				if (typeof fnPromiseResolve === "function") {
					fnPromiseResolve();
				}
			},
			_onRouteMatched: function (oEvent) {
				var oArgs, oView;
				oArgs = oEvent.getParameter("arguments");
				oView = this.getView();
				oView.bindElement({
					path: "/Categories(" + oArgs.CategoryID + ")",
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function (oEvent) {
							oView.setBusy(true);
						},
						dataReceived: function (oEvent) {
							oView.setBusy(false);
						}
					}
				});
			},
			_onBindingChange: function (oEvent) {
				// No data for the binding
				if (!this.getView().getBindingContext()) {
					this.getRouter().getTargets().display("notFound");
				}
			},
			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("DetailPage1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.oRouter.getRoute("DetailPage1_binded").attachMatched(this._onRouteMatched, this);
				var oView = this.getView();
				oView.addEventDelegate({
					onBeforeShow: function () {
						if (sap.ui.Device.system.phone) {
							var oPage = oView.getContent()[0];
							if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
								oPage.setShowNavButton(true);
								oPage.attachNavButtonPress(function () {
									this.oRouter.navTo("MasterPage1", {}, true);
								}.bind(this));
							}
						}
					}.bind(this)
				});
			},
			/**
			 *@memberOf com.sap.build.standard.llMd.controller.DetailPage1
			 */
			action: function (oEvent) {
				var that = this;
				var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
				var eventType = oEvent.getId();
				var aTargets = actionParameters[eventType].targets || [];
				aTargets.forEach(function (oTarget) {
					var oControl = that.byId(oTarget.id);
					if (oControl) {
						var oParams = {};
						for (var prop in oTarget.parameters) {
							oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
						}
						oControl[oTarget.action](oParams);
					}
				});
				var oNavigation = actionParameters[eventType].navigation;
				if (oNavigation) {
					var oParams = {};
					(oNavigation.keys || []).forEach(function (prop) {
						oParams[prop.name] = encodeURIComponent(JSON.stringify({
							value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
							type: prop.type
						}));
					});
					if (Object.getOwnPropertyNames(oParams).length !== 0) {
						this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
					} else {
						this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
					}
				}
			}
		});
	}, /* bExport= */
	true);