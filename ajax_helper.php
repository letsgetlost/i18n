<?php
function ajaxRequest($func} {
    if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        if (function_exists($func)) {
            header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
            header('Expires: Tue, 9 Mar 1965 12:30:00 GMT'); // Date in the past
            header('Content-type: application/json; charset=utf-8');
            set_error_handler('ajaxErrorHandler');
            $func();
            ajaxResponse();
        } else {
            ajaxResponse(501,'function not defined: ' . $func);
        }
   }
}

function ajaxResponse($replyCode = 200, $replyText = 'Ok', $data) {
    if (is_array($data)) {
        $jData = json_encode($data);
    } else {
        trigger_error('La funzione ajaxResponse accetta solo dati in forma di array', E_USER_ERROR);
    }
    echo '{"replyCode":' , $replyCode , ',"replyText":"' , $replyText , '"' , $jData, '}';
    exit;
}

function ajaxErrorHandler($errno, $errstr, $errfile, $errline)    {
    switch ($errno) {
        case E_USER_ERROR:
            echo '{"replyCode":501,"replyText":"User Error: '
                , addslashes($errstr) . '","errno":', $errno;
            break;
        case E_USER_WARNING:
            echo '{"replyCode":502,"replyText":"User Warning: '
                , addslashes($errstr) . '","errno":', $errno;
            break;
        case E_USER_NOTICE:
        case E_NOTICE:
            return false;
        default:
            echo '{"replyCode":500,"replyText":"'
                , addslashes($errstr) . '","errno":', $errno;
            break;
    }
    if ($errfile) {
        echo ',"errfile":"' , addslashes($errfile) ,'"';
    }
    if ($errline) {
        echo ',"errline":"', $errline ,'"';
    }
    echo '}';
    die();
}
