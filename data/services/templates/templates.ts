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
<mj-head>
    <mj-style>
        a {
            color: #3d3d3d;
            text-decoration: underline;
        }
    </mj-style>
</mj-head>
<mj-body background-color="#fafafa">
    <mj-section background-color="white">
        <mj-column>
            <mj-text font-size="20px" align="center" color="#171717" font-family="helvetica">
                <%=title%>#<%=orderNumber%>
            </mj-text>
            <% if (costumer) {%>
                <mj-divider border-color="#3d3d3d" border-width="2px" />
                <mj-text font-size="16px" align="left" color="#171717" font-family="helvetica">
                    <%=titles['contact']%>
                </mj-text>
                <mj-table>
                    <tr>
                        <td style="font-weight: bold; width: 200px">
                            <%=titles['name']%>
                        </td>
                        <td><%=costumer.firstName%></td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">
                            <%=titles['lastName']%>
                        </td>
                        <td>
                            <%=costumer.lastName%>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">
                            <%=titles['email']%>
                        </td>
                        <td>
                            <%=costumer.email%>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">
                            <%=titles['phone']%>
                        </td>
                        <td>
                            <%=costumer.phone%>
                        </td>
                    </tr>
                </mj-table>
            <% } %>

            <mj-divider border-color="#3d3d3d" border-width="2px" />
            <mj-text font-size="16px" align="left" color="#171717" font-family="helvetica">
                <%=titles['paymentMethod']%>
            </mj-text>
            <mj-table>
                <tr>
                    <td style="font-weight: bold; width: 200px">
                        <%=titles['name']%>
                    </td>
                    <td><%=paymentMethod.name%></td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">
                        <%=titles['additionalDetails']%>
                    </td>
                    <td><%=paymentMethod.additionalDetails%></td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">
                        <%=titles['paymentInstructions']%>
                    </td>
                    <td><%=paymentMethod.paymentInstructions%></td>
                </tr>
            </mj-table>

            <% if (shippingType === 'shipment') { %>
                <mj-divider border-color="#3d3d3d" border-width="2px" />
                <mj-text font-size="16px" align="left" color="#171717" font-family="helvetica">
                    <a href="https://maps.google.com/?q=<%=location.latitude%>,<%=location.longitude%>&mode=d" target="_blank">
                        <%=titles['shippingAddress']%>
                    </a>
                </mj-text>
                <mj-table>
                    <tr>
                        <td style="font-weight: bold; width: 200px">
                            <%=titles['shippingAddress']%>
                        </td>
                        <td>
                            <%=address.address1%>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;"></td>
                        <td>
                            <%=address.address2%>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">
                            <%=titles['city']%>
                        </td>
                        <td>
                            <%=address.city%>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">
                            <%=titles['province']%>
                        </td>
                        <td>
                            <%=address.province%>
                        </td>
                    </tr>
                    <% if(address.deliveryInstructions) {%>
                        <tr>
                            <td style="font-weight: bold;">
                                <%=titles['deliveryInstructions']%>
                            </td>
                            <td>
                                <%=address.deliveryInstructions%>
                            </td>
                        </tr>
                    <% } %>
                </mj-table>
            <% } %>
            <% if (shippingType === 'pickup') { %>
                <mj-divider border-color="#3d3d3d" border-width="2px" />
                <mj-text font-size="16px" align="left" color="#171717" font-family="helvetica">
                    <a href="https://maps.google.com/?q=<%=pickupLocation.latitude%>,<%=pickupLocation.longitude%>&mode=d" target="_blank">
                        <%=titles['pickupLocation']%>
                    </a>
                </mj-text>
                <mj-table>
                    <tr>
                        <td style="font-weight: bold; width: 200px">
                            <%=titles['pickupLocationName']%>
                        </td>
                        <td>
                            <%=pickupLocation.name%>
                        </td>
                    </tr>
                    <% if(pickupLocation.additionalDetails) {%>
                        <tr>
                            <td style="font-weight: bold; width: 200px">
                                <%=titles['additionalDetails']%>
                            </td>
                            <td>
                                <%=pickupLocation.additionalDetails%>
                            </td>
                        </tr>
                    <% } %>
                </mj-table>
            <% } %>
            <mj-divider border-color="#3d3d3d" border-width="2px" />
            <mj-text font-size="16px" align="left" color="#171717" font-family="helvetica">
                <%=titles['items']%>
            </mj-text>
            <mj-table>
                <tr style="text-align:left; font-weight: bold;">
                    <th><%=titles['product']%></th>
                    <th><%=titles['option']%> 1</th>
                    <th><%=titles['option']%> 2</th>
                    <th><%=titles['option']%> 3</th>
                    <th><%=titles['quantity']%></th>
                    <th style="text-align:right;"><%=titles['total']%></th>
                </tr>
                <% items.forEach(function(item){ %>
                    <tr>
                        <td><%=item.name%></td>
                        <td><%=item.option1 || '-'%></td>
                        <td><%=item.option2 || '-'%></td>
                        <td><%=item.option3 || '-'%></td>
                        <td><%=item.quantity%></td>
                        <td style="text-align:right;">
                            $<%=item.total.toFixed(2)%>
                        </td>
                    </tr>
                <% }); %>
                <tr style="border-top:1px solid #ecedee;">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style="text-align:right;">
                        $<%=total.toFixed(2)%>
                    </td>
                </tr>
            </mj-table>
        </mj-column>
    </mj-section>
</mj-body>
</mjml>`;
