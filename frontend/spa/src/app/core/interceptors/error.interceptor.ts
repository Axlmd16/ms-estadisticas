import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Ha ocurrido un error desconocido';

                if (error.error instanceof ErrorEvent) {
                    // Error del lado del cliente
                    errorMessage = error.error.message;
                } else {
                    // Error del lado del servidor
                    if (error.status === 0) {
                        errorMessage = 'No se puede conectar con el servidor';
                    } else if (error.status === 400) {
                        errorMessage = 'Solicitud inválida';
                        if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        }
                    } else if (error.status === 401) {
                        errorMessage = 'No autorizado';
                    } else if (error.status === 403) {
                        errorMessage = 'Acceso denegado';
                    } else if (error.status === 404) {
                        errorMessage = 'Recurso no encontrado';
                    } else if (error.status === 500) {
                        errorMessage = 'Error interno del servidor';
                    }
                }

                // Aquí podrías mostrar el error en un servicio de notificaciones
                console.error('Error:', errorMessage);

                return throwError(() => new Error(errorMessage));
            })
        );
    }
}
