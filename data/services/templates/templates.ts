export const authTemplate = `<mjml>
<mj-body background-color="#fafafa">
    <mj-section background-color="white">
        <mj-column>
            <mj-image width="100px" src="<%=logo%>"></mj-image>
            <mj-divider border-color="<%=accent%>" border-width="2px"></mj-divider>
            <mj-text font-size="14px" align="center" color="#171717" font-family="helvetica"><%=intro%></mj-text>
            <mj-text font-size="14px" align="center" color="#171717" font-family="helvetica"><%=message%></mj-text>
            <mj-divider border-color="<%=accent%>" border-width="2px"></mj-divider>
            <mj-text font-size="20px" color="<%=accent%>" font-family="helvetica" align="center"><%=code%></mj-text>
        </mj-column>
    </mj-section>
</mj-body>
</mjml>`;

export const orderShippingUpdateTemplate = `<mjml>
<mj-body background-color="#fff">
  <mj-section background-color="#fff" padding-top="20px">
    <mj-column width="25%">
      <mj-image
        src="https://cdn.unstock.shop/f2cf6dde-f6aa-44c5-837d-892c7438ed3d/email/logo.jpeg"
        alt=""
        align="center"
        border="none"
        width="100px"
        padding-left="0px"
        padding-right="0px"
        padding-top="10px"
      >
      </mj-image>
    </mj-column>
    <mj-column width="75%" padding-top="10px">
      <mj-text align="left" padding-left="25px" padding-right="25px">
        <p style="font-family: Helvetica, Ariel, sans-serif; font-size: 15px">
        <%=storeName%>
        </p>
        <p style="font-family: Helvetica, Ariel, sans-serif; font-size: 15px">
          Orden: #<%=orderNumber%>
        </p>
        <p style="font-family: Helvetica, Ariel, sans-serif; font-size: 15px">
          Fecha: <%=date%>
        </p>
      </mj-text>
    </mj-column>
  </mj-section>
​
  <mj-section background-color="#fff">
    <mj-column width="90%">
      <mj-text padding-bottom="0px" padding-top="0px">
        <p style="font-family: Helvetica, Ariel, sans-serif; font-size: 20px">
          ¡Gracias por tu compra!
        </p>
        <p>
          Hola <%=clientName%>, estamos preparando tu pedido para enviarlo. Te
          notificaremos cuando vayamos a entregartelo.
        </p>
      </mj-text>
      <mj-divider border-width="1px" border-color="lightgrey" />
    </mj-column>
  </mj-section>
​
  <mj-section background-color="#fff" padding-top="0px">
    <mj-column width="90%">
      <mj-text padding-top="0px" padding-bottom="0px">
        <p style="font-family: Helvetica, Ariel, sans-serif; font-size: 17px">
          Resumen de tu orden:
        </p>
      </mj-text>
    </mj-column>
  </mj-section>
​
  <mj-section background-color="#fff" padding-top="0px" padding-bottom="0px">
    <mj-column vertical-align="middle" width="30%">
      <mj-image
        padding="25px"
        align="center"
        mj-class="img-bordered"
        src="https://cdn.shopify.com/s/files/1/0269/7759/files/bow_tie-07_large.png?v=1540853250"
        alt="Bow Tie Image"
        width="75px"
      ></mj-image>
    </mj-column>
    <mj-group vertical-align="middle" width="70%">
      <mj-column>
        <mj-text align="left"
          ><strong>Fire HD 8</strong><br />
          Blue/Kids Edition/64GB<br />
          Cantidad: 1</mj-text
        >
      </mj-column>
      <mj-column>
        <mj-text align="right"><strong>Precio: $69.00</strong></mj-text>
      </mj-column>
    </mj-group>
  </mj-section>
  <!-- Delivery date and Total amount -->
​
  <mj-section>
    <mj-column width="90%">
      <mj-divider border-width="1px" border-color="lightgrey"
    /></mj-column>
  </mj-section>
​
  <mj-section>
    <mj-column>
      <mj-table width="45%" align="right">
        <tr>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
            "
          >
            Envio
          </td>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
              font-weight: bold;
            "
          >
            GRATIS
          </td>
        </tr>
        <tr>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
            "
          >
            Impuestos
          </td>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
              font-weight: bold;
            "
          >
            $3.90
          </td>
        </tr>
        <tr>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
            "
          >
            Total
          </td>
          <td
            style="
              padding: 0 15px 0 0;
              font-family: Helvetica, Ariel, sans-serif;
              font-size: 15px;
              font-weight: bold;
            "
          >
            $72.90
          </td>
        </tr>
      </mj-table>
    </mj-column>
  </mj-section>
​
  <mj-section>
    <mj-column width="90%">
      <mj-divider border-width="1px" border-color="lightgrey"
    /></mj-column>
  </mj-section>
​
  <mj-section
    background-color="#ffffff"
    padding-bottom="0px"
    padding-top="10px"
  >
    <mj-column width="45%">
      <mj-text>
        <strong
          style="font-family: Helvetica, Ariel, sans-serif; font-size: 12px"
          >Dirección de Facturación:
        </strong>
        <hr style="border: 0.5px solid lightgrey" />
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Jose Jaen
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          El nazareno sector A, primera calle
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Tercera Casa, mano derecha.
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Colón, Panamá
        </p>
      </mj-text>
    </mj-column>
    <mj-column width="45%">
      <mj-text>
        <strong
          style="font-family: Helvetica, Ariel, sans-serif; font-size: 12px"
          >Dirección de Facturación:
        </strong>
        <hr style="border: 0.5px solid lightgrey" />
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Jose Jaen
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          El nazareno sector A, primera calle
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Tercera Casa, mano derecha.
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Colón, Panamá
        </p>
      </mj-text>
    </mj-column>
  </mj-section>
​
  <mj-section
    background-color="#ffffff"
    padding-bottom="0px"
    padding-top="0px"
  >
    <mj-column width="90%">
      <mj-text>
        <strong
          style="font-family: Helvetica, Ariel, sans-serif; font-size: 12px"
          >Metodo de Pago:
        </strong>
        <hr style="border: 0.5px solid lightgrey" width="45%" align="left" />
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          VISA Que termina en 2211.
        </p>
        <p style="font-weight: bold">Monto: $69.00</p>
      </mj-text>
    </mj-column>
  </mj-section>
​
  <mj-section
    background-color="#ffffff"
    padding-bottom="0px"
    padding-top="0px"
  >
    <mj-column width="90%">
      <mj-text>
        <strong
          style="font-family: Helvetica, Ariel, sans-serif; font-size: 12px"
          >Método de Envío:
        </strong>
        <hr style="border: 0.5px solid lightgrey" width="45%" align="left" />
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          Uno Express Delivery (Gratis)
        </p>
        <p
          style="
            line-height: 1px;
            font-family: Helvetica, Ariel, sans-serif;
            font-size: 12px;
          "
        >
          24 a 72 horas aproximadamente
        </p>
      </mj-text>
    </mj-column>
  </mj-section>
​
  <mj-section>
    <mj-column width="90%">
      <mj-divider border-width="1px" border-color="lightgrey"
    /></mj-column>
  </mj-section>
​
  <mj-section background-color="#fff">
    <mj-column>
      <mj-text
        align="center"
        color="#45495d"
        font-size="10px"
        line-height="14px"
      >
        <p style="font-family: Helvetica, Ariel, sans-serif">
          Si tienes alguna pregunta, responde este correo electrónico o
          contáctanos a través de: <a href="">tienda@unstock.shop</a>
        </p>
        <p style="font-family: Helvetica, Ariel, sans-serif">
          Panama, Panama <br />@2020 Unstock LLC All Rights Reserved
        </p>
      </mj-text>
    </mj-column>
  </mj-section>
</mj-body>
</mjml>`;
