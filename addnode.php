<?php
/**
 * addnode.php
 * 
 * Questo script consente di creare un nuovo nodo in una struttura ad albero
 * Il nodo può essere una directory o un file.
 * Lo script riceve in input il parametro type (dir|file) e il fully qualified
 * pathname fqFileName
 *
 * @author Maurizio Firmani <firmani@istat.it> 
 * @version 0.1 
 */
ini_set('track_errors', '1');
$type = $_GET["type"];
$fqFileName = $_GET["fqfilename"];

switch ($type) {
	case "dir":
		// verifico che la directory non sia esistente o che il nome scelto 
		// non sia gia' utilizzato per un file
		if ( is_dir($fqFileName) || is_file($fqFileName) ) {
			echo '{"Result": {"status":"error", "msg":"'.basename($fqFileName).': nodo esistente"} }';
		} else {	
			
			if ( @mkdir($fqFileName, 0755) ) {
				echo '{"Result": {"status":"success", "fqDirName":"'.$fqFileName.'"} }';
			} else {
				//error 
				echo '{"Result": {"status":"error", "msg":"'.$php_errormsg.'"} }';
			}
		}
	break;
	case "file":
		// verifico che la directory non sia esistente
		if ( is_dir($fqFileName) || is_file($fqFileName) ) {
		}
		
	break;
}
