sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./Popover1",
		"./utilities",
		"sap/ui/core/routing/History"
	], function (BaseController, MessageBox, Popover1, Utilities, History) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.llMd.controller.MasterPage1", {
			handleRouteMatched: function (oEvent) {
				var sAppId = "App5cfe0bb752e93a3710524b07";
				var oParams = {};
				var oView = this.getView();
				var bSelectFirstListItem = true;
				if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
					this.sContext = oEvent.mParameters.data.context;
					this.sMasterContext = oEvent.mParameters.data.masterContext;
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
						this.sMasterContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
					}
				}
				var oPath;
				if (this.sMasterContext && oEvent.getParameters().config.bypassed.target[0] !== this.sMasterContext) {
					oPath = {
						path: "/" + this.sMasterContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				} else if (this.sContext) {
					var sCurrentContextPath = "/" + this.sContext;
					bSelectFirstListItem = false;
				}
				if (bSelectFirstListItem) {
					oView.addEventDelegate({
						onBeforeShow: function () {
							var oContent = this.getView().getContent();
							if (oContent) {
								if (!sap.ui.Device.system.phone) {
									var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
									if (oList) {
										var sContentName = oList.getMetadata().getName();
										if (sContentName.indexOf("List") > -1) {
											oList.attachEventOnce("updateFinished", function () {
												var oFirstListItem = this.getItems()[0];
												if (oFirstListItem) {
													oList.setSelectedItem(oFirstListItem);
													oList.fireItemPress({
														listItem: oFirstListItem
													});
												}
											}.bind(oList));
										}
									}
								}
							}
						}.bind(this)
					});
				}
			},
			_attachSelectListItemWithContextPath: function (sContextPath) {
				var oView = this.getView();
				var oContent = this.getView().getContent();
				if (oContent) {
					if (!sap.ui.Device.system.phone) {
						var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
						if (oList && sContextPath) {
							var sContentName = oList.getMetadata().getName();
							var oItemToSelect, oItem, oContext, aItems, i;
							if (sContentName.indexOf("List") > -1) {
								if (oList.getItems().length) {
									oItemToSelect = null;
									aItems = oList.getItems();
									for (i = 0; i < aItems.length; i++) {
										oItem = aItems[i];
										oContext = oItem.getBindingContext();
										if (oContext && oContext.getPath() === sContextPath) {
											oItemToSelect = oItem;
										}
									}
									if (oItemToSelect) {
										oList.setSelectedItem(oItemToSelect);
									}
								} else {
									oView.addEventDelegate({
										onBeforeShow: function () {
											oList.attachEventOnce("updateFinished", function () {
												oItemToSelect = null;
												aItems = oList.getItems();
												for (i = 0; i < aItems.length; i++) {
													oItem = aItems[i];
													oContext = oItem.getBindingContext();
													if (oContext && oContext.getPath() === sContextPath) {
														oItemToSelect = oItem;
													}
												}
												if (oItemToSelect) {
													oList.setSelectedItem(oItemToSelect);
												}
											});
										}
									});
								}
							}
						}
					}
				}
			},
			_onObjectListItemPress: function (oEvent) {
				var oItem, oCtx;
				oItem = oEvent.getSource();
				oCtx = oItem.getBindingContext();
				this.getOwnerComponent().getRouter().navTo("DetailPage1_binded", {
					CategoryID: oCtx.getProperty("CategoryID")
				});
				/*var oBindingContext = oEvent.getSource().getBindingContext();

						return new Promise(function (fnResolve) {

							this.doNavigate("DetailPage1", oBindingContext, fnResolve, "");
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
			_onButtonPress: function (oEvent) {
				var sPopoverName = "Popover1";
				this.mPopovers = this.mPopovers || {};
				var oPopover = this.mPopovers[sPopoverName];
				if (!oPopover) {
					oPopover = new Popover1(this.getView());
					this.mPopovers[sPopoverName] = oPopover;
					oPopover.getControl().setPlacement("Auto");
					// For navigation.
					oPopover.setRouter(this.oRouter);
				}
				var oSource = oEvent.getSource();
				oPopover.open(oSource);
			},
			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("MasterPage1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			},
			/**
			 *@memberOf com.sap.build.standard.llMd.controller.MasterPage1
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