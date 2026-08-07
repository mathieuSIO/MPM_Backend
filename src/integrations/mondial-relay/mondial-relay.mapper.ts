import { BadRequestError } from "../../errors/http-errors.js";
import type { MondialRelayPoint, MondialRelayPointRaw, } from "./mondial-relay.types.js";

export class MondialRelayMapper {
    toRelayPoint(point: MondialRelayPointRaw): MondialRelayPoint {
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
            id: String(point.Num).padStart(6, "0"),

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

            postalCode: String(point.CP),

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