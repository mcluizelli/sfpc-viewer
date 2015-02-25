        $('#btAdd').on('click', function(){
          var table = document.getElementById('nf-table');
          var row = table.insertRow(1);
          var cellID = row.insertCell(0);
          var cellNF = row.insertCell(1);
          var cellMEM = row.insertCell(2);
          var cellCPU = row.insertCell(3);
          var cellINST = row.insertCell(4);
          var cellBTN = row.insertCell(5);

          cellID.innerHTML = document.getElementById('nf-id').value;
          cellNF.innerHTML = document.getElementById('nf-name').value;
          cellMEM.innerHTML = document.getElementById('mem-nf').value;
          cellCPU.innerHTML = document.getElementById('cpu-nf').value;
          cellINST.innerHTML = document.getElementById('inst-nf').value;

          cellBTN.innerHTML = "<center><button type='button' class='btn btn-danger btn-xs' id='removeID' onClick='$(this).parent().parent().remove()'>Remove</button> <button type='button' class='btn btn-default btn-xs' data-toggle=modal' data-target='#modal1' data-whatever='@mdo'>Edit</button></center>";
          
        })

        $('#btClear').on('click', function(){
          $('#nf-table tr:not(:first)').remove();
        })

        
        