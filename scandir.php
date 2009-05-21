<?php
/**
 * Effettua la scansione di una directory. Restituisce un oggetto JSON che
 * rappresenta il contenuto della directory indicata come parametro (root)
 * della richiesta. L'oggetto JSON ha la seguente struttura:
 *
 * { "replyCode": "codice_numerico_3_cifre",
 *   "replyText": "Messaggio",
 *   "data": [
 *            {"type"      : "file | dir",
 *             "label"     : "etichetta del nodo visualizzata nell'albero",
 *             "fqFileName": "fully qualified filename"
 *            }
 *           ]
 * }
 *
 * Se la richiesta è di tipo AJAX, la risposta viene codificata opportunamente
 * in modo che sia presente anche un codice corrispondente allo stato
 * dell'esecuzione dello script
 *
 * @param{string} root directory di partenza
 * @return JSON object
 * @author Maurizio Firmani <firmani@istat.it>
 * @version 0.1 Mon Apr 27 18:06:29 CEST 2009
 */

/**
 * Verifica se la richiesta è stata inoltrata da script Ajax. In tal caso
 * imposta gli header necessari per la risposta e definisce la modalità di
 * gestione degli errori
 */
function ajaxRequest() {
	if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
		header('Expires: Tue, 9 Mar 1965 12:30:00 GMT'); // Date in the past
		header('Content-type: application/json; charset=utf-8');
		set_error_handler('ajaxErrorHandler');
	}
}

/**
 *
 * @param string $replyCode
 * @param string $replyText
 * @param array $data
 */
function ajaxResponse($replyCode='200', $replyText='Ok', $data='') {
	$_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
	if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		if (func_num_args() == '3') {
			$data = func_get_arg(2);
			if (is_array($data)) {
				// Codifico l'array utilizzando json_encode. Per ottenere
				// l'oggetto nella forma specificata nell'introduzione
				// dobbiamo manipolare la stringa restituita dalla funzione
				// json_encode
				$output = json_encode($data);
				$jData = ','.substr($output, 1, strlen($output)-2);
			} else {
				trigger_error('La funzione ajaxResponse accetta solo dati in forma di array', E_USER_ERROR);
			}
		}
		echo '{"replyCode":' , $replyCode , ',"replyText":"' , $replyText , '"' , $jData, '}';
		exit;
	}
}

function ajaxErrorHandler($errno, $errstr, $errfile, $errline)    {
	switch ($errno) {
		case E_USER_ERROR:
			echo '{"replyCode":501,"replyText":"User Error: ';
			echo addslashes($errstr);
			echo '","errno":'.$errno;
			break;
		case E_USER_WARNING:
			echo '{"replyCode":502,"replyText":"User Warning: ';
			echo addslashes($errstr);
			echo '","errno":'. $errno;
			break;
		case E_USER_NOTICE:
		case E_NOTICE:
			return false;
		default:
			echo '{"replyCode":500,"replyText":"';
			echo addslashes($errstr);
			echo '","errno":'. $errno;
			break;
	}
	if ($errfile) {
		echo ',"errfile":"'.addslashes($errfile).'"';
	}
	if ($errline) {
		echo ',"errline":"'.$errline .'"';
	}
	echo '}';
	die();
}


$base = $_REQUEST["root"];
ajaxRequest();
if (is_dir($base)) {
	if ($handle = opendir($base)) {
		$nodeArr["data"] = array();
		$i = 0;
		while (($file = readdir($handle)) !== false) {
			if ($file != "." && $file != "..") {
				$filename = "$base/$file";
				$nodeArr["data"][$i]['label'] = $file;
				$nodeArr["data"][$i]['fqFileName'] = $filename;
				if (is_file($filename)) {
					$nodeArr["data"][$i]['type'] = 'file';
				} else if (is_dir("$base/$file")) {
					$nodeArr["data"][$i]['type'] = 'dir';
				}
				$i++;
			}
		}
		closedir($handle);
		ajaxResponse('200', 'Ok', $nodeArr);
	}
} else {
	echo "errore\n";
}

