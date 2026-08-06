import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";

import { env } from "../config/env.js";
import {
    BadRequestError,
    NotFoundError,
} from "../errors/http-errors.js";

import type {
    MondialRelayPoint,
    MondialRelayPointRaw,
    ValidateMondialRelayPointInput,
} from "../types/mondial-relay.types.js";

const SOAP_ACTION =
    "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche";

const XML_NAMESPACE =
    "http://www.mondialrelay.fr/webservice/";

export class MondialRelayService {
    private readonly parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true,
        trimValues: true,
    });

    async validateRelayPoint(
        input: ValidateMondialRelayPointInput
    ): Promise<MondialRelayPoint> {
        const relayPointId = input.relayPointId.trim();
        const country = input.country.trim().toUpperCase();

        const parameters = {
            Enseigne: env.mondialRelayEnseigne,
            Pays: country,
            NumPointRelais: relayPointId,
            Ville: "",
            CP: "",
            Latitude: "",
            Longitude: "",
            Taille: "",
            Poids: "",
            Action: env.mondialRelayDefaultAction,
            DelaiEnvoi: "0",
            RayonRecherche: "0",
            TypeActivite: "",
            NACE: "",
            NombreResultats: "1",
        };

        const security = this.createSecurityHash(parameters);

        let response: Response;

        try {
            response = await fetch(
                env.mondialRelayApiUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml; charset=utf-8",
                        SOAPAction: `"${SOAP_ACTION}"`,
                    },
                    body: this.createSoapEnvelope(
                        parameters,
                        security
                    ),
                    signal: AbortSignal.timeout(10_000),
                }
            );
        } catch (error) {
            console.error(
                "Mondial Relay API request failed:",
                error
            );

            throw new BadRequestError(
                "Mondial Relay service is currently unavailable"
            );
        }

        if (!response.ok) {
            throw new BadRequestError(
                "Mondial Relay service is currently unavailable"
            );
        }

        const xml = await response.text();
        const parsed = this.parser.parse(xml);

        const result =
            parsed?.Envelope?.Body
                ?.WSI4_PointRelais_RechercheResponse
                ?.WSI4_PointRelais_RechercheResult;

        if (!result) {
            throw new BadRequestError(
                "Invalid response from Mondial Relay"
            );
        }

        const relayPoint =
            result?.PointsRelais?.PointRelais_Details;

        if (!relayPoint) {
            throw new NotFoundError(
                "Mondial Relay point not found"
            );
        }

        const rawPoint = Array.isArray(relayPoint)
            ? relayPoint[0]
            : relayPoint;

        return this.mapRelayPoint(rawPoint);
    }

    private createSecurityHash(parameters: {
        Enseigne: string;
        Pays: string;
        NumPointRelais: string;
        Ville: string;
        CP: string;
        Latitude: string;
        Longitude: string;
        Taille: string;
        Poids: string;
        Action: string;
        DelaiEnvoi: string;
        RayonRecherche: string;
        TypeActivite: string;
        NACE: string;
        NombreResultats: string;
    }): string {
        const value = [
            parameters.Enseigne,
            parameters.Pays,
            parameters.NumPointRelais,
            parameters.Ville,
            parameters.CP,
            parameters.Latitude,
            parameters.Longitude,
            parameters.Taille,
            parameters.Poids,
            parameters.Action,
            parameters.DelaiEnvoi,
            parameters.RayonRecherche,
            parameters.TypeActivite,
            parameters.NombreResultats,
            env.mondialRelayPrivateKey,
        ].join("");

        return crypto
            .createHash("md5")
            .update(value, "utf8")
            .digest("hex")
            .toUpperCase();
    }

    private createSoapEnvelope(
        parameters: {
            Enseigne: string;
            Pays: string;
            NumPointRelais: string;
            Ville: string;
            CP: string;
            Latitude: string;
            Longitude: string;
            Taille: string;
            Poids: string;
            Action: string;
            DelaiEnvoi: string;
            RayonRecherche: string;
            TypeActivite: string;
            NACE: string;
            NombreResultats: string;
        },
        security: string
    ): string {
        return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <WSI4_PointRelais_Recherche xmlns="${XML_NAMESPACE}">
            <Enseigne>${this.escapeXml(parameters.Enseigne)}</Enseigne>
            <Pays>${this.escapeXml(parameters.Pays)}</Pays>
            <NumPointRelais>${this.escapeXml(parameters.NumPointRelais)}</NumPointRelais>
            <Ville></Ville>
            <CP></CP>
            <Latitude></Latitude>
            <Longitude></Longitude>
            <Taille></Taille>
            <Poids></Poids>
            <Action>${this.escapeXml(parameters.Action)}</Action>
            <DelaiEnvoi>${this.escapeXml(parameters.DelaiEnvoi)}</DelaiEnvoi>
            <RayonRecherche>${this.escapeXml(parameters.RayonRecherche)}</RayonRecherche>
            <TypeActivite></TypeActivite>
            <NACE></NACE>
            <NombreResultats>${this.escapeXml(parameters.NombreResultats)}</NombreResultats>
            <Security>${security}</Security>
        </WSI4_PointRelais_Recherche>
    </soap:Body>
</soap:Envelope>`;
    }

    private mapRelayPoint(
        point: MondialRelayPointRaw
    ): MondialRelayPoint {
        const status = String(point.STAT ?? "");

        if (status !== "0") {
            throw new BadRequestError(
                `Mondial Relay returned status ${status}`
            );
        }

        if (
            !point.Num ||
            !point.LgAdr1 ||
            !point.LgAdr3 ||
            !point.CP ||
            !point.Ville ||
            !point.Pays
        ) {
            throw new BadRequestError(
                "Incomplete Mondial Relay point data"
            );
        }

        return {
            id: point.Num,
            name: [
                point.LgAdr1,
                point.LgAdr2,
            ]
                .filter(
                    (value): value is string =>
                        typeof value === "string" &&
                        value.length > 0
                )
                .join(" "),

            addressLine1: point.LgAdr3,

            addressLine2:
                point.LgAdr4?.trim() || null,

            postalCode: point.CP,
            city: point.Ville,
            country: point.Pays.toUpperCase(),

            latitude: this.parseCoordinate(
                point.Latitude
            ),

            longitude: this.parseCoordinate(
                point.Longitude
            ),
        };
    }

    private parseCoordinate(
        coordinate?: string
    ): number | null {
        if (!coordinate) {
            return null;
        }

        const normalized = coordinate.replace(
            ",",
            "."
        );

        const value = Number(normalized);

        return Number.isFinite(value)
            ? value
            : null;
    }

    private escapeXml(value: string): string {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&apos;");
    }
}