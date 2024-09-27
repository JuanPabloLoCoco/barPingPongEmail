import { describe, test, expect } from "@jest/globals";
import {
  CancelReservation as CancelAppointment,
  emailParsing,
  NewReservation,
  ReservationType,
} from "./emailParsing.mjs";

describe("Email parsing", () => {
  function validateEmailParsing(
    received: unknown,
    expected: Partial<NewReservation | CancelAppointment> &
      Pick<NewReservation | CancelAppointment, "type">
  ) {
    expect(received).toHaveProperty("type");
    const reservation = received as NewReservation | CancelAppointment;
    expect(reservation.type).toBe(expected.type);

    // Validate the reservation object
    expect(reservation).toHaveProperty("name");
    if (expected.name !== undefined) {
      expect(reservation.name).toBe(expected.name);
    }
    expect(reservation).toHaveProperty("venue");
    if (expected.venue !== undefined) {
      expect(reservation.venue).toBe(expected.venue);
    }
    expect(reservation).toHaveProperty("startDate");
    expect(reservation.startDate).toBeInstanceOf(Date);
    expect(reservation.startDate).toEqual(expected.startDate);

    if (reservation.type === ReservationType.NEW) {
      expect(reservation).toHaveProperty("phone");
      const expRes = expected as NewReservation;
      if (expRes.phone !== undefined) {
        expect(reservation.phone).toBe(expRes.phone);
      }
    }
  }

  test("Parse reservation email should return a new reservation object", () => {
    const parsedEmail = emailParsing(newAppointment, new Date("2024-01-01"));

    // expect(parsedEmail).toEqual(reservation);
    validateEmailParsing(parsedEmail, {
      type: ReservationType.NEW,
      name: "Juan Ignacio",
      venue: "MESA 5 ROSITA",
      phone: "+541158030338",
      startDate: new Date("2024-06-29T16:00:00Z"),
    });
  });

  test("Parse cancelation reservation shoul return a cancelation reservation object", () => {
    const parsedEmail = emailParsing(cancelAppointment, new Date("2024-01-01"));

    validateEmailParsing(parsedEmail, {
      type: ReservationType.CANCEL,
      name: "Rodrigo Gilabert",
      venue: "MESA 3",
      startDate: new Date("2024-07-02T23:00:00Z"),
    });
  });
});
const newAppointment: string = `<div style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;height:100%;line-height:1.4;margin:0px;word-break:break-word;width:100%!important;background-color:rgb(245,248,250);color:rgb(116,120,126)">


    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px;padding:0px;width:100%;background-color:rgb(245,248,250)">
        <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
            <td align="center" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px;padding:0px;width:100%">
                    <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:25px 0px;text-align:center">
        <a href="https://u27605774.ct.sendgrid.net/ls/click?upn=u001.XOtITsfxDgqA0JaU5hqJUBRtmj8XOUpuhVItMBVJrfvlcqUQpqu7li6qgp0WVfo-2BBKHnNIs1HHWGMhzjMdiLGX3XzDzs48JgnMagpjv7WgNOkHymwzLZQYZgtvSnFz899ilv6roz-2BUFppNhOpfcBDg-3D-3D3jz6_CmGHt9UoGjfsxPVNJ-2F-2B-2F-2FeLCtVTVkp-2FLA8ba2WNILOsSZxLqlUILioKQ2iz59hoAUlN9YQNGfubk7FnWhlqu-2BnpU9UEyykEnyvEYq2z4GL7KvWOsAocMamuMnCG19UeUs6vk56NEUKTkcaQ249rq1gxNFL-2FhYxGicKZZ7cAeTSmWoR5D5Ar5T-2FE-2FpqKqvgkiirw9xwcX-2B6Qlh51OrjUV3A-3D-3D" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:19px;font-weight:bold;text-decoration:none;color:rgb(187,191,195)" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://u27605774.ct.sendgrid.net/ls/click?upn%3Du001.XOtITsfxDgqA0JaU5hqJUBRtmj8XOUpuhVItMBVJrfvlcqUQpqu7li6qgp0WVfo-2BBKHnNIs1HHWGMhzjMdiLGX3XzDzs48JgnMagpjv7WgNOkHymwzLZQYZgtvSnFz899ilv6roz-2BUFppNhOpfcBDg-3D-3D3jz6_CmGHt9UoGjfsxPVNJ-2F-2B-2F-2FeLCtVTVkp-2FLA8ba2WNILOsSZxLqlUILioKQ2iz59hoAUlN9YQNGfubk7FnWhlqu-2BnpU9UEyykEnyvEYq2z4GL7KvWOsAocMamuMnCG19UeUs6vk56NEUKTkcaQ249rq1gxNFL-2FhYxGicKZZ7cAeTSmWoR5D5Ar5T-2FE-2FpqKqvgkiirw9xwcX-2B6Qlh51OrjUV3A-3D-3D&amp;source=gmail&amp;ust=1722824623219000&amp;usg=AOvVaw09PyvaTUPQTUO7cY49Fo8R">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NYzIhtuEMMb4kZOVPfTKyMQNz1GDEk9fVGuS7nXGMWyxKSsVQMMOV_TL0YnxV6gr5iRztofLKH3DtFlbVaYlbKBBKbo3hIhwTKHBlI7Ik4HpPnH5CjcSwhZJmRW-UuQJuHLugv0KvV3AbBWHzhREyhbrfbzl6bFjWY=s0-d-e1-ft#https://alquilatucancha-public.s3.sa-east-1.amazonaws.com/production/public/mail/Logo-completo.webp" style="border:medium;margin:0px;padding:0px;font-family:&quot;Helvetica Neue&quot;,Helvetica,Helvetica,Arial,sans-serif;box-sizing:border-box;font-size:14px;max-width:260px" class="CToWUd" data-bit="iit">
        </a>
    </td>
</tr>


                    <tr style="font-family:Avenir,Helvetica,sans-serif">
                        <td width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;border-top-width:1px;border-top-style:solid;margin:0px;padding:0px;width:100%;background-color:rgb(255,255,255);border-top-color:rgb(237,239,242);border-bottom-color:rgb(237,239,242)">
                            <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px auto;padding:0px;width:600px;background-color:rgb(255,255,255)">

                                <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
                                    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:35px">
                                        <h1 style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:19px;font-weight:bold;margin-top:0px;text-align:left;color:rgb(47,49,51)">¡Nueva reserva online!</h1>
<h2 style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:16px;margin-top:0px;text-align:left;color:rgb(116,120,126)">Un nuevo turno ha sido reservado online.</h2>
<div style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
  <table style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:30px auto;width:100%">
<thead style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
<tr style="font-family:Avenir,Helvetica,sans-serif">
<th style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;padding-bottom:8px;margin:0px;border-bottom-color:rgb(237,239,242)">Detalles</th>
<th style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;padding-bottom:8px;margin:0px;text-align:right;border-bottom-color:rgb(237,239,242)"></th>
</tr>
</thead>
<tbody style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Nombre</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">Juan Ignacio</td>
</tr>
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Teléfono</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">+541158030338</td>
</tr>
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Cancha</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">MESA 5 ROSITA</td>
</tr>
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Dia y hora</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">Saturday 29 de June a las 13:00</td>
</tr>
</tbody>
</table>
</div>
<p style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:16px;line-height:1.5em;margin-top:0px;text-align:left;color:rgb(116,120,126)">¡No te olvides de <strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">calificar</strong> al jugador al finalizar el turno, así él podrá calificarte también!</p>


                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>

                    <tr style="font-family:Avenir,Helvetica,sans-serif">
    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
        <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px auto;padding:0px;text-align:center;width:570px">
            <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
                <td align="center" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:35px">
                    <p style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;line-height:1.5em;margin-top:0px;font-size:12px;text-align:center;color:rgb(174,174,174)">© 2024 AlquilaTuCancha. Todos los derechos reservados.</p>
                </td>
            </tr>
        </tbody></table>
    </td>
</tr>
                </tbody></table>
            </td>
        </tr>
    </tbody></table>
<img src="https://ci3.googleusercontent.com/meips/ADKq_NapeC1-n2PVNoaPDQpnGcV0RWwI3ZE_8IgPNfsyEtFQf1AyrtudcLBL6Yv8IrGA78rtKE5AJ6Z_iSviwgZDsfT-1GSVAYy2CdikbVFwxUt2iPOeflVjTZxekydr5CF8SrzGlb0q0pgzWMS66285F5s5KZCN3TFYmBwWStA7KTllphTluFcxC76taEoFKd_LiKZSc4OyA4W58mlxMJenAwmOc37qvMiQu1AwAIQ0hcW5kqs0ldnN07QVgCg-LaH3yObp5gKB20eVFgjaxQVECw2K2NV_D81GG8AV8DRbu-gQzgWkdArWvtTKQpqISKucI2VHQA2ybJ_sYmzF-uOeefZzG3KJCzryzUeRx1oUCyMxqAYC6GuuTGw0HmeF2oCHCZd6VHWOWGy-dsGEWSXnhaSPbVV7LpVB-zm1SZ6PVppxfkSmhhYKzp8=s0-d-e1-ft#https://u27605774.ct.sendgrid.net/wf/open?upn=u001.Cs1H5G9AAzKPt5RLY-2FdxE0JrJ4c4BGBWuda88X8I-2Box54-2BjrIxx-2B4AqEAxTi0UBWDjYAXbR8nTr4KSEKcMwv4bLbOOis9dehk3xFJGy8QWbkj9Poxk77-2F1mIk5jheeyOtYP7dBM5d0GhvQjUlGMlmFswZCH46R-2FxBr5PlAFpeJyb4Ie1wu7zdYR-2BJhcoKH0e5w3UOIhThMir9U-2BA1RiFufRiz5N3mM4HfbpbVl776co-3D" alt="" width="1" height="1" border="0" style="font-family:Avenir,Helvetica,sans-serif;height:1px!important;width:1px!important;border-width:0px!important;margin:0px!important;padding:0px!important" class="CToWUd" data-bit="iit"></div>`;

const cancelAppointment: string = `<div style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;height:100%;line-height:1.4;margin:0px;word-break:break-word;width:100%!important;background-color:rgb(245,248,250);color:rgb(116,120,126)">


    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px;padding:0px;width:100%;background-color:rgb(245,248,250)">
        <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
            <td align="center" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px;padding:0px;width:100%">
                    <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:25px 0px;text-align:center">
        <a href="https://u27605774.ct.sendgrid.net/ls/click?upn=u001.XOtITsfxDgqA0JaU5hqJUBRtmj8XOUpuhVItMBVJrfvlcqUQpqu7li6qgp0WVfo-2BBKHnNIs1HHWGMhzjMdiLGX3XzDzs48JgnMagpjv7WgNOkHymwzLZQYZgtvSnFz899ilv6roz-2BUFppNhOpfcBDg-3D-3DaTRj_CmGHt9UoGjfsxPVNJ-2F-2B-2F-2FeLCtVTVkp-2FLA8ba2WNILOs6df4rWAmOXOa4XyOX8-2B0Wy1OVOCGw49HtMkIWD3vmahAoMzeqdR6HPNtF0DZXqEvrR4Emw1yhvadtsZd4zd-2FfLA-2BEdF8nxb1Yq87j2uPU-2BZRWBFH5p-2FUahFdQCTRQBvSyJj0KHCAKQ6FsVsb6-2BPrENu9AcWFbF1721rLHYeiuj-2BKhVzekWtNuBh-2BFgJ9dQAA-3D" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:19px;font-weight:bold;text-decoration:none;color:rgb(187,191,195)" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://u27605774.ct.sendgrid.net/ls/click?upn%3Du001.XOtITsfxDgqA0JaU5hqJUBRtmj8XOUpuhVItMBVJrfvlcqUQpqu7li6qgp0WVfo-2BBKHnNIs1HHWGMhzjMdiLGX3XzDzs48JgnMagpjv7WgNOkHymwzLZQYZgtvSnFz899ilv6roz-2BUFppNhOpfcBDg-3D-3DaTRj_CmGHt9UoGjfsxPVNJ-2F-2B-2F-2FeLCtVTVkp-2FLA8ba2WNILOs6df4rWAmOXOa4XyOX8-2B0Wy1OVOCGw49HtMkIWD3vmahAoMzeqdR6HPNtF0DZXqEvrR4Emw1yhvadtsZd4zd-2FfLA-2BEdF8nxb1Yq87j2uPU-2BZRWBFH5p-2FUahFdQCTRQBvSyJj0KHCAKQ6FsVsb6-2BPrENu9AcWFbF1721rLHYeiuj-2BKhVzekWtNuBh-2BFgJ9dQAA-3D&amp;source=gmail&amp;ust=1722824623193000&amp;usg=AOvVaw2LoX8v5Ff9yreL-4SyKuX4">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NYzIhtuEMMb4kZOVPfTKyMQNz1GDEk9fVGuS7nXGMWyxKSsVQMMOV_TL0YnxV6gr5iRztofLKH3DtFlbVaYlbKBBKbo3hIhwTKHBlI7Ik4HpPnH5CjcSwhZJmRW-UuQJuHLugv0KvV3AbBWHzhREyhbrfbzl6bFjWY=s0-d-e1-ft#https://alquilatucancha-public.s3.sa-east-1.amazonaws.com/production/public/mail/Logo-completo.webp" style="border:medium;margin:0px;padding:0px;font-family:&quot;Helvetica Neue&quot;,Helvetica,Helvetica,Arial,sans-serif;box-sizing:border-box;font-size:14px;max-width:260px" class="CToWUd" data-bit="iit">
        </a>
    </td>
</tr>


                    <tr style="font-family:Avenir,Helvetica,sans-serif">
                        <td width="100%" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;border-top-width:1px;border-top-style:solid;margin:0px;padding:0px;width:100%;background-color:rgb(255,255,255);border-top-color:rgb(237,239,242);border-bottom-color:rgb(237,239,242)">
                            <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px auto;padding:0px;width:600px;background-color:rgb(255,255,255)">

                                <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
                                    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:35px">
                                        <h1 style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:19px;font-weight:bold;margin-top:0px;text-align:left;color:rgb(47,49,51)">Reserva online cancelada</h1>
<div style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
  <table style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:30px auto;width:100%">
<thead style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
<tr style="font-family:Avenir,Helvetica,sans-serif">
<th style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;padding-bottom:8px;margin:0px;border-bottom-color:rgb(237,239,242)">Detalles</th>
<th style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;border-bottom-width:1px;border-bottom-style:solid;padding-bottom:8px;margin:0px;text-align:right;border-bottom-color:rgb(237,239,242)"></th>
</tr>
</thead>
<tbody style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Jugador</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">Rodrigo Gilabert</td>
</tr>
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Cancha</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">MESA 3</td>
</tr>
<tr style="font-family:Avenir,Helvetica,sans-serif">
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;color:rgb(68,157,68)"><strong style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">Dia y hora</strong></td>
<td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;font-size:15px;line-height:18px;padding:10px 0px;margin:0px;text-align:right;color:rgb(116,120,126)">Tuesday 02 de July a las 20:00</td>
</tr>
</tbody>
</table>
</div>


                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>

                    <tr style="font-family:Avenir,Helvetica,sans-serif">
    <td style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box">
        <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;margin:0px auto;padding:0px;text-align:center;width:570px">
            <tbody style="font-family:Avenir,Helvetica,sans-serif"><tr style="font-family:Avenir,Helvetica,sans-serif">
                <td align="center" style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;padding:35px">
                    <p style="font-family:Avenir,Helvetica,sans-serif;box-sizing:border-box;line-height:1.5em;margin-top:0px;font-size:12px;text-align:center;color:rgb(174,174,174)">© 2024 AlquilaTuCancha. Todos los derechos reservados.</p>
                </td>
            </tr>
        </tbody></table>
    </td>
</tr>
                </tbody></table>
            </td>
        </tr>
    </tbody></table>
<img src="https://ci3.googleusercontent.com/meips/ADKq_NY40Yd5HIhKyyUbJp395JtYLVZ_FMekVyVSMom3_hvts3GjOZjBQX-PeCu7aKLt4M_jPk9ToafB7gkgRtfj-xX-otDujjjtXrpw29a552tUnjaCMHAoHGp6lkPsmRD-BIzKajUNExa89bNskeTVyp579M_QSZx4DLZlKtiuWjYoIvoQyAExKMBG8AVJg_SM6x4r2iea0wf5_TDgk6ahhRBH4M0EHtFV5WA85G0f_oqZ73wooCVg6WHuQM4lpg6jSy4cyVqOrpciZdgv5V2UxIs9jGabyV_djPMqxEkP9vP8u0jIpmesOr0sh1nZPdcFKR29_21KXMIu2SlUDI8CCefT1obrC2qb1oEeafDk33WBF1rivU0QEb0NWT4mCCqrsC78ZddSFa7fVwIIKgRiZQ8e5OpcGuLnLe90GKbNTewM8rIUgK3H=s0-d-e1-ft#https://u27605774.ct.sendgrid.net/wf/open?upn=u001.Cs1H5G9AAzKPt5RLY-2FdxE0JrJ4c4BGBWuda88X8I-2BowKS88XbxF8n23gQEf6L8p9CMozXoVvRiKi-2BReomQEXeGDxB6px8Arz1CuUEQFY6QtEoi0tuLhphzAO8SXPYK1Fbz06UbPtWBjHHnGBcAF4LB0YoP-2FmWxKCPqIaZvfHn3hwZBpkQh4zI7-2B-2BTf-2Fo4163l5yfVbnTOryDQPdhjdAuGuQFqkWlLRaqLxEIGv8bPBI-3D" alt="" width="1" height="1" border="0" style="font-family:Avenir,Helvetica,sans-serif;height:1px!important;width:1px!important;border-width:0px!important;margin:0px!important;padding:0px!important" class="CToWUd" data-bit="iit"></div>`;
