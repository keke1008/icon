{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      eachSystem = f: builtins.mapAttrs (system: pkgs: f { inherit system pkgs; }) nixpkgs.legacyPackages;
    in
    {
      packages = eachSystem (
        { pkgs, ... }:
        let
          inherit (pkgs) lib;
          iconSize = "256";
          colors = lib.importJSON ./src/colors.json;
          renderIcon = name: color: ''
            resvg -w ${iconSize} -h ${iconSize} \
              ${pkgs.replaceVars ./src/icon.svg.in color} \
              $out/icon-${name}-${iconSize}.png
          '';

          # previewer/ から ../icon.svg.in を参照するため、src/ と同じ配置で配信する
          previewerRoot = lib.fileset.toSource {
            root = ./src;
            fileset = lib.fileset.unions [
              ./src/previewer
              ./src/icon.svg.in
            ];
          };
          previewerPort = "8000";
        in
        {
          default = pkgs.runCommand "icons" { nativeBuildInputs = [ pkgs.resvg ]; } ''
            mkdir -p $out
            ${lib.concatMapAttrsStringSep "\n" renderIcon colors}
          '';

          previewer = pkgs.writeShellApplication {
            name = "icon-previewer";
            runtimeInputs = [ pkgs.python3 ];
            text = ''
              echo "Previewer: http://localhost:${previewerPort}/previewer/"
              python -m http.server ${previewerPort} -d ${previewerRoot}
            '';
          };
        }
      );

      apps = eachSystem (
        { pkgs, system, ... }: {
          default = {
            type = "app";
            program = toString (
              pkgs.writeShellScript "deploy" ''
                cp -rL --no-preserve=mode ${self.packages."${system}".default}/. dest/
              ''
            );
          };
        }
      );

      devShells = eachSystem (
        { pkgs, ... }: {
          default = pkgs.mkShell {
            packages = with pkgs; [
              python3
              resvg
              typescript
              typescript-language-server
              biome
            ];
          };
        }
      );
    };
}
