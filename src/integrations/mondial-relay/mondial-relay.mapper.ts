import { BadRequestError } from "../../errors/http-errors.js";

import type {
    MondialRelayPoint,
    MondialRelayPointRaw,
} from "./mondial-relay.types.js";

export class MondialRelayMapper {
    
    toRelayPoint(point: MondialRelayPointRaw): MondialRelayPoint {
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
                        value.trim().length > 0
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

    private parseCoordinate(coordinate?: string): number | null {
        if (!coordinate) {
            return null;
        }

        const normalized =
            coordinate.replace(",", ".");

        const value = Number(normalized);

        return Number.isFinite(value)
            ? value
            : null;
    }
}