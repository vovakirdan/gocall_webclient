package main

import (
    "flag"
    "fmt"
    "log"
    "mime"
    "net/http"
)

func init() {
    // На случай если Go не подхватит MIME-тип .js автоматически
    mime.AddExtensionType(".js", "application/javascript")
}

func main() {
    // Параметры запуска
    ip := flag.String("ip", "127.0.0.1", "IP to bind")
    port := flag.String("port", "8443", "Port to bind")
    flag.Parse()

    addr := fmt.Sprintf("%s:%s", *ip, *port)

    // В папке "certificates" должны лежать server.crt и server.key
    certFile := fmt.Sprintf("%s.pem", *ip)
	keyFile := fmt.Sprintf("%s-key.pem", *ip)

    // Отдаём всю папку "dist" как статику
    fs := http.FileServer(http.Dir("./dist"))
    http.Handle("/", fs)

    log.Printf("Starting HTTPS server at https://%s\n", addr)
    err := http.ListenAndServeTLS(addr, certFile, keyFile, nil)
    if err != nil {
        log.Fatal("ListenAndServeTLS error:", err)
    }
}
