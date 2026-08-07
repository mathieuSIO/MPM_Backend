import crypto from "crypto";

import { XMLParser } from "fast-xml-parser";

import { env } from "../../config/env.js";

import {
    BadRequestError,
    NotFoundError,
} from "../../errors/http-errors.js";

import {
    MONDIAL_RELAY_POINT_SEARCH_SOAP_ACTION,
    MONDIAL_RELAY_REQUEST_TIMEOUT_MS,
    MONDIAL_RELAY_XML_NAMESPACE,
} from "./mondial-relay.constants.js";

import { MondialRelayMapper } from "./mondial-relay.mapper.js";

import type {
    MondialRelayPoint,
    MondialRelayPointRaw,
    MondialRelaySearchParameters,
    ValidateMondialRelayPointInput,
} from "./mondial-relay.types.js";

export class MondialRelayClient {
    private readonly parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true,
        trimValues: true,
    });

    constructor(
        private readonly mapper =
            new MondialRelayMapper()
    ) { }

    async validateRelayPoint(
        input: ValidateMondialRelayPointInput
    ): Promise<MondialRelayPoint> {
        const relayPointId =
            input.relayPointId.trim();

        const country =
            input.country.trim().toUpperCase();

        const parameters =
            this.createSearchParameters({
                relayPointId,
                country,
            });

        const security =
            this.createSecurityHash(parameters);

        const xml =
            await this.requestRelayPointSearch(
                parameters,
                security
            );

        const rawPoint =
            this.extractRelayPoint(xml);

        return this.mapper.toRelayPoint(rawPoint);
    }

    private createSearchParameters(input: {
        relayPointId: string;
        country: string;
    }): MondialRelaySearchParameters {
        return {
            Enseigne: env.mondialRelayEnseigne,
            Pays: input.country,
            NumPointRelais: input.relayPointId,
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
    }

    private createSecurityHash(
        parameters: MondialRelaySearchParameters
    ): string {
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

    private async requestRelayPointSearch(
        parameters: MondialRelaySearchParameters,
        security: string
    ): Promise<string> {
        let response: Response;

        try {
            response = await fetch(
                env.mondialRelayApiUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "text/xml; charset=utf-8",
                        SOAPAction:
                            `"${MONDIAL_RELAY_POINT_SEARCH_SOAP_ACTION}"`,
                    },
                    body: this.createSoapEnvelope(
                        parameters,
                        security
                    ),
                    signal: AbortSignal.timeout(
                        MONDIAL_RELAY_REQUEST_TIMEOUT_MS
                    ),
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

        return response.text();
    }

    private extractRelayPoint(xml: string): MondialRelayPointRaw {
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

        const status = String(result.STAT ?? "");

        if (status !== "0") {
            throw new BadRequestError(
                `Mondial Relay returned status ${status}`
            );
        }

        const relayPoint =
            result?.PointsRelais
                ?.PointRelais_Details;

        if (!relayPoint) {
            throw new NotFoundError(
                "Mondial Relay point not found"
            );
        }

        return Array.isArray(relayPoint)
            ? relayPoint[0]
            : relayPoint;
    }

    private createSoapEnvelope(parameters: MondialRelaySearchParameters, security: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>
                    <soap:Envelope
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Body>
                            <WSI4_PointRelais_Recherche xmlns="${MONDIAL_RELAY_XML_NAMESPACE}">
                                <Enseigne>${this.escapeXml(parameters.Enseigne)}</Enseigne>
                                <Pays>${this.escapeXml(parameters.Pays)}</Pays>
                                <NumPointRelais>${this.escapeXml(parameters.NumPointRelais)}</NumPointRelais>
                                <Ville>${this.escapeXml(parameters.Ville)}</Ville>
                                <CP>${this.escapeXml(parameters.CP)}</CP>
                                <Latitude>${this.escapeXml(parameters.Latitude)}</Latitude>
                                <Longitude>${this.escapeXml(parameters.Longitude)}</Longitude>
                                <Taille>${this.escapeXml(parameters.Taille)}</Taille>
                                <Poids>${this.escapeXml(parameters.Poids)}</Poids>
                                <Action>${this.escapeXml(parameters.Action)}</Action>
                                <DelaiEnvoi>${this.escapeXml(parameters.DelaiEnvoi)}</DelaiEnvoi>
                                <RayonRecherche>${this.escapeXml(parameters.RayonRecherche)}</RayonRecherche>
                                <TypeActivite>${this.escapeXml(parameters.TypeActivite)}</TypeActivite>
                                <NACE>${this.escapeXml(parameters.NACE)}</NACE>
                                <NombreResultats>${this.escapeXml(parameters.NombreResultats)}</NombreResultats>
                                <Security>${security}</Security>
                            </WSI4_PointRelais_Recherche>
                        </soap:Body>
                    </soap:Envelope>`;
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