/**
 * @projectDescription Script per la gestione del multilinguismo dei contenuti
 * di www.istat.it. Al momento le lingue supportate sono italiano e inglese
 * 
 * @author	Maurizio Firmani firmani@istat.it
 * @version	0.1 
 */

/**
 * Configurazione
 */
// URL
var server = "tamigi11.istat.it";
//var server = "localhost";

var scanDirUrl = "http://" + server + "/test/i18n/scandir.php?root=";
var addNodeUrl = "http://" + server +"/test/i18n/addnode.php";
var baseRoot = "/var/www/" + server.slice(0,(server.indexOf(".")> 0 ? server.indexOf(".") : server.length))  + "/htdocs/test/i18n/en_root";
// String
var sEditNode = "Modifica documento";
var sEditNodeLabel = "Modifica nome directory";
var sNewDir = "Crea directory";
var sNewFile = "Nuovo documento";
var sDelDir = "Elimina directory";
var sDelFile = "Elimina documento";
var sNewDirLabel = "Inserire il nome della nuova directory:";
var sNewFileLabel = "Inserire il nome del nuovo documento:";

// Oggetto contenente le espressioni regolari per il controllo dei dati
// del modulo nonché i messaggi corrispondenti da visualizzare nel caso in
// cui il controllo dell'espressione regolare fallisce
var formValidation = {
	rules: {
		required: /./,
		requiredNotWhiteSpace: /\S/
	},
	errors: {
		required: "Campo obbligatorio",
		requiredNotWhiteSpace: "Niente spazi bianchi"
	}
};

//global variable to allow console inspection of tree:
var tree;
//var dialog;
var oTextNodeMap = {};
var oCurrentTextNode = null;

/**
 * Costruisce l'albero delle directory  
 * 
 */
function treeInit() {
   tree = new YAHOO.widget.TreeView("en_tree");
   // Caricamento dinamico dei dati 
   tree.setDynamicLoad(loadDataForNode);

   var root = tree.getRoot();
   var baseLabel = baseRoot.replace(/.*\//, "");
   var tmpNode = new YAHOO.widget.TextNode({ label: baseLabel, fqFileName: baseRoot, type: "dir" }, root, false);
   oTextNodeMap[tmpNode.labelElId] = tmpNode;
   tree.render();
}

/**
 * Caricamento dinamico dei dati
 * @param {Object} node
 * @param {Function} onCompleteCallback
 */
function loadDataForNode(node, onCompleteCallback) {
 	var nodeRoot = node.data.fqFileName;
	var sUrl = scanDirUrl + nodeRoot;
    //prepare our callback object
	var callback = {
		success: function(nodes) {
			/*success handler code*/
			if (YAHOO.lang.isArray(nodes)) {
				var len = nodes.length;
				for (var i = 0, j = len; i < j; i++) {
					var oNodeData = nodes[i];
					var tmpNode = new YAHOO.widget.TextNode(oNodeData, node, false);
					oTextNodeMap[tmpNode.labelElId] = tmpNode;
					if (oNodeData.type == 'file') {
						tmpNode.isLeaf = true;
					}
				}
				onCompleteCallback();
			} else {
				// Errore
				alert("Errore. nodes non è un array");
				onCompleteCallback();
			}
		}
	}
	// Esecuzione script per caricamento dati
    //YAHOO.util.Connect.asyncRequest('GET', sUrl, callback);
	ajaxConnect('GET', sUrl, callback);

}

/**
 * Crea una finestra di dialogo per l'inserimento di dati
 * @param {string} title Messaggio che compare nella barra del titolo
 * @param {string} size Dimensione in pixel della finestra di dialog
 * @param {Object} formData Oggetto contenente le informazioni necessarie per la
 *	 creazione del form
 */
function makeDialog(title, size, formData) {

	var dialog = new YAHOO.widget.Dialog("formDialog",
			{ width : size +"px",
			  fixedcenter : true,
			  visible : false,
			  constraintoviewport : true
			 } );


	dialog.setHeader(title);

	// Definiamo gli elementi da inserire nella finestra

	// elemento form
	var elForm = document.createElement('form');
	elForm.setAttribute('method', formData.form.method);
	elForm.setAttribute('action', formData.form.action);
	elForm.setAttribute('id', formData.form.id);

	// Utilizziamo dl, dt e dd
	var elDl = document.createElement("dl");
	elForm.appendChild(elDl);

	// elemento/i di tipo input
	for (var i = 0, len = formData.input.length; i < len; ++i) {

		var oInput = formData.input[i];

		if (oInput.type == "text") {

			var elDt = document.createElement("dt");
			elDl.appendChild(elDt);

			var elLabel = document.createElement('label');
			elLabel.setAttribute('for', oInput.name);
			elLabel.innerHTML = oInput.label;
			elDt.appendChild(elLabel);
		
			var elDd = document.createElement("dd");
			elDl.appendChild(elDd);

			var elInput = document.createElement('input');
			elInput.setAttribute('type', oInput.type);
			elInput.setAttribute('name',oInput.name);

			// Generazione Id per l'elemento creato
			//var elID = YAHOO.util.Event.generateId(elInput);
			elInput.setAttribute('id', oInput.id);

			if ("className" in oInput) {
				elInput.setAttribute('class', oInput.className);
			}
			// Se richiesto (validate: true), inseriamo un event-listener
			if ("validate" in oInput) {
				YAHOO.util.Event.onBlur(oInput.id, eleValidate);
				YAHOO.util.Event.addListener(oInput.id, "keyup", clearError);
			}

			if ("value" in oInput) {
				elInput.setAttribute('value', oInput.value);
			}
			elDd.appendChild(elInput);
		} else {
			// inserire istruzioni per input tipo hidden
		}

	}

	dialog.setBody(elForm);

	return dialog;

}

/**
 * Effettua la connessione con il server utilizzando la funzione asyncRequest di
 * YUI Connection Manager con gli stessi parametri
 * @param{string} method, metodo HTTP utilizzato
 * @param{string} url URL
 * @param{object} oCallback Contiene gli handler per la gestione della risposta
 * @param{string} postBody
 * @return true o una stringa di errore
 */
function ajaxConnect(method, url, oCallback, postBody) {
	// L'oggetto oCallback contiene i metodi success/failure che DEVONO
	// essere definiti nella funzione chiamante perché specifici a tale
	// contesto.
	
	// Definiamo l'oggetto callback per la richiesta XHR
	
	var callback = {
		success: function(o) {
			// Effettuiamo il parsing dell'oggetto JSON di risposta
			//
			// response.replyCode (string)
			// response.replyText (string)
			// response.data (array)

			var response = YAHOO.lang.JSON.parse(o.responseText);

			// Gestione risposta
			switch(true) {
				case /^2/.test(response.replyCode):
					// script eseguito correttamente
					console.log(YAHOO.lang.dump(response.data));
					oCallback.success(response.data);
					break;
				case /^4/.test(response.replyCode):
					// script non eseguito. Richiesta client non corretta
					console.log("errore: " + response.replyCode);
					break;
				case /^5/.test(response.replyCode):
					// errore esecuzione script
					console.log("errore: " + response.replyCode);
					break;
				default:
					// azione di default
			}

			
			
		},
		failure: function(o) {
			alert("Ajax request Failed!");
		}
	}
	
	// impostiamo un timeout di default di 5 secondi
	oCallback.timeout = oCallback.timeout ? oCallback.timeout : 5000;

	// GET è il metodo di default
	method = (typeof postBody == "undefined") ? "GET" : "POST";
	if (method.toUpperCase() == "GET") {
		YAHOO.util.Connect.asyncRequest(method, url, callback);
	} else if (method.toUpperCase() == "POST") {
		YAHOO.util.Connect.asyncRequest(method, url, oCallback, postBody);
	}
}

/**
 * Inserisce il messaggio di errore creando un elemento figlio
 * dell'elemento contenente l'errore
 * @param(element) object Elemento contenente l'errore
 * @param(errMsg) string Messaggio di errore
 */
function showError(element, errMsg) {
	YAHOO.util.Dom.addClass(element.id, "error");
	var next = YAHOO.util.Dom.getNextSibling(element);
	var errorMsg = document.createTextNode(errMsg);
	// Se l'elemento next ha una classe di tipo error-msg
	if (next && YAHOO.util.Dom.hasClass(next, "error-msg")) {
		// sostituiamo il messaggio contenuto nell'elemento figlio
		var el = new YAHOO.util.Element(next);
		var oldNode = el.get('firstChild');
		el.replaceChild(errorMsg, oldNode);
	} else {
		// l'elemento em non esiste e allora lo creiamo
		var errorBlock = document.createElement("em");
		YAHOO.util.Dom.addClass(errorBlock, "error-msg");
		YAHOO.util.Dom.insertAfter(errorBlock, element.id);
		errorBlock.appendChild(errorMsg);
	}

}

/**
 * Rimuove il messaggio di errore e l'elemento figlio che lo contiene
 * @param(element) object Elemento contenente l'errore
 */
function clearError(element) {
	YAHOO.util.Event.stopEvent(element);
	// Modifico il contenuto della classe dell'elemento
	var oldValue = this.className;
	var newValue = oldValue.replace("error", "");
	YAHOO.util.Dom.replaceClass(this, oldValue, newValue);
	// Elimino la classe del blocco di errore
	var next = YAHOO.util.Dom.getNextSibling(this);
	if (next) {
		next.parentNode.removeChild(next);
	}
}

/**
 * Effettua dei controlli sui campi di input per verificare la correttezza dei
 * dati inseriti dall'utente. I campi sottoposti a controllo sono indicati
 * come elementi dell'attributo class (cfr. oggetto formValidation)
 * @param(id) string | object Identificativo dell'elemento form oppure
 * l'evento che ha innescato il controllo
 *
 */
function eleValidate(id) {
	// Se è presente l'identificativo dell'elemento form
	// allora recuperiamo tutti gli elementi di tipo input presenti nel form
	// e li sottoponiamo a verifica
	// altrimenti la verifica viene attivata dal listener

	var pattern;

	if (typeof(id)  == "string") {
		//scansione elementi
		// recuperiamo tutti gli elementi di tipo input presenti nel form
		pattern = "#" + id + " input";
	} else {
		pattern = "#" + this.name;
	}

	var fields = YAHOO.util.Selector.query(pattern);
	
	for (var i = 0; i < fields.length; i++) {
		var className = fields[i].className;
		var classResult = className.split(" ");
		for (var j = 0; j < classResult.length; j++) {
			var rule = formValidation.rules[classResult[j]];
			/* Se esiste (typeof) la regola 'rule' nell'oggetto formValidation
			 * verifichiamo (rule.test) la corrispondenza del valore inserito
			 * dall'utente con la regola attuale. Se non c'è match vuol
			 * dire che il valore inserito non è valido e accanto al modulo
			 * viene inserito un elemento span per visualizzare il messaggio
			 * di errore corrispondente
			 */

			if (typeof rule != "undefined") {
				//
				if (!rule.test(fields[i].value)) {
					//YAHOO.util.Event.stopEvent(id);
					showError(fields[i], formValidation.errors[classResult[j]]);
					return false;
				} 
			}
		}
	}

	// I controlli sono stati superati con successo
	return true
}


/**
 * Aggiunge un nodo all'albero
 * @param {Object} event
 * @param {Object} oEvent
 * @param {Object} nodeType
 */
function addNode(event, oEvent, nodeType) {
	var oChildNode;
	var sLabel;
	
	switch(nodeType) {
		case "dir":
			sLabel = sNewDirLabel;
		break;
		case "file":
			sLabel = sNewFileLabel;
		break;	 	
	}
	
	
	var title = "Inserimento dati";
	var size = "500"; //in px

	// Costruzione oggetto contenente le informazioni per la funzione makeDialog
	var formData = {
		"form": { "method": "POST",
				  "action": addNodeUrl,
				  "id": "frmId"
			    },
		"input": [
				{
					"label": sLabel,
					"type": "text",
					"className": "requiredNotWhiteSpace",
					"validate": true,
					"id": "nodename",
					"name": "nodename"
				}
			]
	};

	dialog = makeDialog(title, size, formData);

	/* Si faccia attenzione al fatto che la chiamata alla funzione validate
	 * viene fatta solo all'interno della proprietà submit (cfr. container.js
	 * linea 7914)
	 */
	//dialog.validate = eleValidate;

	var handleSubmit = function() {
		if (eleValidate(formData.form.id)) {
			dialog.submit();
		} else {
			alert("No submit");
		}
	}

	var handleCancel = function() {
		dialog.cancel();
	}

	var buttons = [ { text:"Submit", handler:handleSubmit, isDefault:true },
					{ text:"Cancel", handler:handleCancel } ];

	dialog.cfg.queueProperty("buttons", buttons);
	dialog.render(document.body);
	dialog.show();
	

	/*
	if (sLabel && sLabel.length > 0) {
		//effettuiamo connessione con server
		var fqFileName = oCurrentTextNode.data.fqFileName + "/" + sLabel;
		var sUrl = addNodeUrl + "?type=" + nodeType + "&fqfilename=" + fqFileName;
    	//prepare our callback object
    	var callback = {
	  		success: function(oResponse) {
	  		//success handler code
				var oResults = eval("(" + oResponse.responseText + ")");
				//alert("oResults: " + YAHOO.lang.dump(oResults));
				if ((oResults.Result.status == "success")) {
					//onCompleteCallback();
					oChildNode = new YAHOO.widget.TextNode( { label: sLabel, fqFileName: fqDirName, type: "dir" }, oCurrentTextNode, false); 
					//alert("oChildNode: " + YAHOO.lang.dump(oChildNode));
					oCurrentTextNode.refresh(); 
					oCurrentTextNode.expand(); 
					oTextNodeMap[oChildNode.labelElId] = oChildNode; 
				} else {
				// Nodo esistente
					showMsg();
					//alert("errore " + oResults.Result.msg );
					//onCompleteCallback();
				}	
      		},
	  	failure: function(o) {
	  		//failure handler code
			alert('No OK');
	  	},
	  	timeout: 5000,
		}
    	YAHOO.util.Connect.asyncRequest('GET', sUrl, callback);
	  }
	  */
}

function editNode() {
	alert("fqFileName: " + oCurrentTextNode.data.fqFileName);
	
}

function deleteNode() {
	alert("fqFileName: " + oCurrentTextNode.data.fqFileName);
}

/**
 * dialog
 */

function showMsg() {
	var handleOK = function(){
		this.hide();
	}
	
	var panelMsg = new YAHOO.widget.SimpleDialog("panelMsg", 
						{ width:"320px", 
						  visible:false, 
						  draggable:false,
						  fixedcenter:true,
						  modal:true,
						  zindex:9999,
						  icon: YAHOO.widget.SimpleDialog.ICON_ALARM,
						  close:false,
						  buttons: [
							{ text: 'OK', handler: handleOK, isDefault: true }
							]
						} ); 
	panelMsg.setHeader("Alert!");
	panelMsg.setBody("Errore");
	//panelMsg.setFooter("End of Panel #2");
	panelMsg.render(document.body);
	panelMsg.show();
}


/* Context menu */

var oContextMenuItems = {
	"file": [
				{ text: sEditNode, onclick: { fn: editNode}},
				{ text: sDelFile, onclick: { fn: deleteNode}}
			],
	"dir": [
				{ text: sNewDir, onclick: { fn: addNode, obj: "dir"}},
				{ text: sEditNodeLabel, onclick: { fn: editNode}},
				{ text: sDelDir, onclick: { fn: deleteNode}},
				{ text: sNewFile, onclick: { fn: addNode, obj: "file"}}
			]
};

function onTriggerContextMenu(p_oEvent){
	var oTarget = this.contextEventTarget,
		aMenuItems,
		Dom = YAHOO.util.Dom;
	
	// Recuperiamo l'identificativo del TextNode su cui vogliamo appendere il 
	// menu contestuale
	var oTextNode = Dom.hasClass(oTarget, "ygtvlabel") ? oTarget : Dom.getAncestorByClassName(oTarget, "ygtvlabel");
	if (oTextNode) {
		oCurrentTextNode = oTextNodeMap[oTarget.id];
		aMenuItems = oContextMenuItems[oCurrentTextNode.data.type];
		this.clearContent();
		this.addItems(aMenuItems);
		this.render(oTextNode);
	}
	else {
		// Cancel the instance of the ContextMenu instance
		this.cancel();
	}
}

/** Inizializzazione del Menu Contestuale. Il primo argomento passato al costruttore
 *  è l'id dell'elemento da creare; il secondo elemento è un oggetto che definisce
 *  le proprietà di configurazione.
*/ 
var oContextMenu = new YAHOO.widget.ContextMenu("mytreecontextmenu", {
 	trigger: "en_tree",
	lazyload: true
	});

oContextMenu.subscribe("triggerContextMenu", onTriggerContextMenu);
			
//Add an onDOMReady handler to build the tree when the document is ready
YAHOO.util.Event.onDOMReady(treeInit);
